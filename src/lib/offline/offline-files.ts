import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/** Carpeta de fotos de fichas y estaciones. Otras tareas pueden usar su propia carpeta (p. ej. `'map-tiles'`). */
export const DEFAULT_OFFLINE_FOLDER = 'photos';

const ROOT_FOLDER = 'offline-files';
const DEFAULT_CONCURRENCY = 3;
const KNOWN_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'json', 'geojson', 'pbf'];

export type OfflineDownloadOptions = {
  /** Carpeta dentro de `offline-files/`. Por defecto `'photos'`. */
  folder?: string;
  /** Cancela las descargas pendientes. */
  signal?: AbortSignal;
  /** Descargas simultáneas. Por defecto 3. */
  concurrency?: number;
};

export type OfflineDownloadSummary = {
  downloaded: number;
  skipped: number;
  failed: number;
};

const supported = Platform.OS !== 'web';

/** Hash estable de 53 bits (cyrb53) para nombrar los archivos a partir de la URL. */
function hashUrl(url: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let index = 0; index < url.length; index++) {
    const char = url.charCodeAt(index);
    h1 = Math.imul(h1 ^ char, 2654435761);
    h2 = Math.imul(h2 ^ char, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function extensionOf(url: string): string {
  const path = url.split(/[?#]/)[0] ?? '';
  const match = /\.([a-z0-9]+)$/i.exec(path);
  const extension = match?.[1]?.toLowerCase();
  return extension && KNOWN_EXTENSIONS.includes(extension) ? extension : 'bin';
}

/** Nombre del archivo local de una URL. Determinista: la misma URL siempre da el mismo nombre. */
export function offlineFileName(url: string): string {
  return `${hashUrl(url)}.${extensionOf(url)}`;
}

function folderDirectory(folder: string): Directory {
  return new Directory(Paths.document, ROOT_FOLDER, folder);
}

function fileFor(url: string, folder: string): File {
  return new File(folderDirectory(folder), offlineFileName(url));
}

/**
 * URI local (`file://…`) de una URL ya descargada, o `null` si no está en el dispositivo. Síncrona: se puede
 * llamar al renderizar.
 */
export function getOfflineFileUri(url: string, folder = DEFAULT_OFFLINE_FOLDER): string | null {
  if (!supported || !url) return null;
  try {
    const file = fileFor(url, folder);
    return file.exists ? file.uri : null;
  } catch {
    return null;
  }
}

/**
 * Descarga al dispositivo las URLs que aún no estén guardadas. Los fallos individuales no detienen el resto:
 * se cuentan en el resumen y se reintentan en la siguiente sincronización.
 */
export async function downloadOfflineFiles(
  urls: readonly string[],
  {
    folder = DEFAULT_OFFLINE_FOLDER,
    signal,
    concurrency = DEFAULT_CONCURRENCY,
  }: OfflineDownloadOptions = {},
): Promise<OfflineDownloadSummary> {
  const summary: OfflineDownloadSummary = { downloaded: 0, skipped: 0, failed: 0 };
  if (!supported) return summary;

  const directory = folderDirectory(folder);
  directory.create({ intermediates: true, idempotent: true });

  const pending = [...new Set(urls.filter(Boolean))];
  const worker = async () => {
    for (let url = pending.shift(); url !== undefined; url = pending.shift()) {
      if (signal?.aborted) return;
      const file = fileFor(url, folder);
      if (file.exists) {
        summary.skipped += 1;
        continue;
      }
      try {
        await File.downloadFileAsync(url, file, { idempotent: true, signal });
        summary.downloaded += 1;
      } catch {
        summary.failed += 1;
        // Un archivo a medio escribir no debe pasar por válido en la próxima lectura.
        try {
          if (file.exists) file.delete();
        } catch {
          // Se ignora: se reintentará en la siguiente sincronización.
        }
      }
    }
  };

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return summary;
}

/** Borra de la carpeta los archivos que no correspondan a `keepUrls`. Devuelve cuántos borró. */
export function pruneOfflineFiles(
  keepUrls: readonly string[],
  folder = DEFAULT_OFFLINE_FOLDER,
): number {
  if (!supported) return 0;
  const directory = folderDirectory(folder);
  if (!directory.exists) return 0;
  const keep = new Set(keepUrls.filter(Boolean).map(offlineFileName));
  let removed = 0;
  for (const entry of directory.list()) {
    if (entry instanceof File && !keep.has(entry.name)) {
      entry.delete();
      removed += 1;
    }
  }
  return removed;
}

/** Borra todos los archivos offline de una carpeta (o de todas si no se indica). */
export function clearOfflineFiles(folder?: string): void {
  if (!supported) return;
  const directory = folder ? folderDirectory(folder) : new Directory(Paths.document, ROOT_FOLDER);
  if (directory.exists) directory.delete();
}

/**
 * Copia un archivo local (p. ej. la foto elegida en el selector, cuya URI puede desaparecer) a
 * `offline-files/<carpeta>/<nombre>` y devuelve la nueva URI. En web no hay sistema de archivos: devuelve la
 * misma URI. Si ya existía un archivo con ese nombre, lo reemplaza.
 */
export function storeLocalFile(sourceUri: string, folder: string, name: string): string {
  if (!supported) return sourceUri;
  const directory = folderDirectory(folder);
  directory.create({ intermediates: true, idempotent: true });
  const target = new File(directory, name);
  if (target.exists) target.delete();
  new File(sourceUri).copy(target);
  return target.uri;
}

/** Borra un archivo local por su URI. No falla si ya no existe. */
export function removeLocalFile(uri: string): void {
  if (!supported || !uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Se ignora: un archivo que no se pudo borrar no afecta a la app.
  }
}
