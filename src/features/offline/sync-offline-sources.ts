import { type QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';
import {
  DEFAULT_OFFLINE_FOLDER,
  bumpOfflineFilesVersion,
  downloadOfflineFiles,
  getOfflineFileUri,
  pruneOfflineFiles,
  reportBackendUnreachable,
  saveOfflineSyncSuccess,
  updateOfflineSyncStatus,
  type OfflineSource,
} from '@/lib/offline';

import { OFFLINE_SOURCES } from './constants';

export type OfflineSyncResult = {
  /** Fuentes cuyos datos se actualizaron. */
  synced: string[];
  /** Fuentes que fallaron (se reintentan en la siguiente sincronización). */
  failed: string[];
  /** Archivos nuevos guardados en el dispositivo. */
  downloaded: number;
};

/** Un fallo sin respuesta del servidor (red o tiempo agotado): el backend no está al alcance. */
function isUnreachable(error: unknown): boolean {
  return isApiError(error) && error.kind !== 'http';
}

/**
 * Sincroniza las fuentes offline: pide sus datos a la API, descarga los archivos nuevos y borra los que ya no
 * se usan. Solo poda la carpeta de una fuente si todas las fuentes de esa carpeta se sincronizaron bien, para
 * no borrar fotos válidas por un fallo de red.
 *
 * Publica su avance en `offline-sync-status` (`@/lib/offline`) para que la interfaz muestre la descarga.
 */
export async function syncOfflineSources(
  queryClient: QueryClient,
  {
    sources = OFFLINE_SOURCES,
    signal,
  }: { sources?: readonly OfflineSource[]; signal?: AbortSignal } = {},
): Promise<OfflineSyncResult> {
  const result: OfflineSyncResult = { synced: [], failed: [], downloaded: 0 };
  const urlsByFolder = new Map<string, string[]>();
  const failedFolders = new Set<string>();
  updateOfflineSyncStatus({ phase: 'syncing', files: { done: 0, total: 0 }, downloaded: 0 });

  try {
    for (const source of sources) {
      if (signal?.aborted) return aborted(result);
      const folder = source.folder ?? DEFAULT_OFFLINE_FOLDER;
      try {
        const urls = await source.prefetch(queryClient);
        urlsByFolder.set(folder, [...(urlsByFolder.get(folder) ?? []), ...urls]);
        result.synced.push(source.name);
      } catch (error) {
        if (isUnreachable(error)) reportBackendUnreachable();
        failedFolders.add(folder);
        result.failed.push(source.name);
      }
    }

    // Solo cuentan para el progreso los archivos que aún no están en el dispositivo.
    const pendingByFolder = new Map<string, number>();
    for (const [folder, urls] of urlsByFolder) {
      const unique = [...new Set(urls.filter(Boolean))];
      pendingByFolder.set(folder, unique.filter((url) => !getOfflineFileUri(url, folder)).length);
    }
    const total = [...pendingByFolder.values()].reduce((sum, count) => sum + count, 0);
    let done = 0;
    updateOfflineSyncStatus({ files: { done, total } });

    let downloadFailed = false;
    for (const [folder, urls] of urlsByFolder) {
      if (signal?.aborted) return aborted(result);
      let folderDone = 0;
      const summary = await downloadOfflineFiles(urls, {
        folder,
        signal,
        onProgress: ({ downloaded, failed }) => {
          const processed = downloaded + failed;
          if (processed === folderDone) return;
          done += processed - folderDone;
          folderDone = processed;
          updateOfflineSyncStatus({ files: { done, total } });
        },
      });
      result.downloaded += summary.downloaded;
      if (summary.failed > 0) downloadFailed = true;
      if (!failedFolders.has(folder) && summary.failed === 0) pruneOfflineFiles(urls, folder);
      bumpOfflineFilesVersion();
    }

    if (signal?.aborted) return aborted(result);
    const ok = result.failed.length === 0 && !downloadFailed;
    updateOfflineSyncStatus({ phase: ok ? 'done' : 'failed', downloaded: result.downloaded });
    if (ok) await saveOfflineSyncSuccess(Date.now());
    return result;
  } catch (error) {
    updateOfflineSyncStatus({ phase: 'failed', downloaded: result.downloaded });
    throw error;
  }
}

/** Corrida cancelada (p. ej. se perdió la red): no es un fallo ni un éxito. */
function aborted(result: OfflineSyncResult): OfflineSyncResult {
  updateOfflineSyncStatus({ phase: 'idle', downloaded: result.downloaded });
  return result;
}
