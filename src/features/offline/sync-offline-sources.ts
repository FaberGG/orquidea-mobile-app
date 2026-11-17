import { type QueryClient } from '@tanstack/react-query';

import {
  DEFAULT_OFFLINE_FOLDER,
  downloadOfflineFiles,
  pruneOfflineFiles,
  type OfflineSource,
} from '@/lib/offline';

import { OFFLINE_SOURCES } from './constants';

export type OfflineSyncResult = {
  /** Fuentes cuyos datos se actualizaron. */
  synced: string[];
  /** Fuentes que fallaron (se reintentan en la siguiente sincronización). */
  failed: string[];
};

/**
 * Sincroniza las fuentes offline: pide sus datos a la API, descarga los archivos nuevos y borra los que ya no
 * se usan. Solo poda la carpeta de una fuente si todas las fuentes de esa carpeta se sincronizaron bien, para
 * no borrar fotos válidas por un fallo de red.
 */
export async function syncOfflineSources(
  queryClient: QueryClient,
  {
    sources = OFFLINE_SOURCES,
    signal,
  }: { sources?: readonly OfflineSource[]; signal?: AbortSignal } = {},
): Promise<OfflineSyncResult> {
  const result: OfflineSyncResult = { synced: [], failed: [] };
  const urlsByFolder = new Map<string, string[]>();
  const failedFolders = new Set<string>();

  for (const source of sources) {
    if (signal?.aborted) return result;
    const folder = source.folder ?? DEFAULT_OFFLINE_FOLDER;
    try {
      const urls = await source.prefetch(queryClient);
      urlsByFolder.set(folder, [...(urlsByFolder.get(folder) ?? []), ...urls]);
      result.synced.push(source.name);
    } catch {
      failedFolders.add(folder);
      result.failed.push(source.name);
    }
  }

  for (const [folder, urls] of urlsByFolder) {
    if (signal?.aborted) return result;
    const summary = await downloadOfflineFiles(urls, { folder, signal });
    if (!failedFolders.has(folder) && summary.failed === 0) pruneOfflineFiles(urls, folder);
  }
  return result;
}
