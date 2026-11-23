import { useMemo } from 'react';

import { DEFAULT_OFFLINE_FOLDER, getOfflineFileUri } from '@/lib/offline';

import { useOfflineFilesVersion } from './use-offline-sync-status';

/**
 * Copia local (`file://…`) de `url` si ya se descargó para uso offline (`downloadOfflineFiles`), o `null`. La
 * comprobación es síncrona y se repite al cambiar la URL o los archivos en disco (p. ej. al terminar una
 * descarga).
 */
export function useLocalOfflineFileUri(
  url: string | null | undefined,
  folder: string = DEFAULT_OFFLINE_FOLDER,
): string | null {
  const filesVersion = useOfflineFilesVersion();
  return useMemo(
    () => (url ? getOfflineFileUri(url, folder) : null),
    // `filesVersion` no se usa dentro, pero obliga a volver a mirar el disco cuando cambia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, folder, filesVersion],
  );
}

/**
 * Devuelve la copia local de `url` si ya se descargó para uso offline y, si no, la propia `url`. `null` si no
 * hay URL.
 */
export function useOfflineFileUri(
  url: string | null | undefined,
  folder: string = DEFAULT_OFFLINE_FOLDER,
): string | null {
  const local = useLocalOfflineFileUri(url, folder);
  return local ?? url ?? null;
}
