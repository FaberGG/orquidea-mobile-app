import { useMemo } from 'react';

import { DEFAULT_OFFLINE_FOLDER, getOfflineFileUri } from '@/lib/offline';

/**
 * Devuelve la copia local de `url` si ya se descargó para uso offline (`downloadOfflineFiles`) y, si no, la
 * propia `url`. `null` si no hay URL. La comprobación es síncrona y se repite solo cuando cambia la URL.
 */
export function useOfflineFileUri(
  url: string | null | undefined,
  folder: string = DEFAULT_OFFLINE_FOLDER,
): string | null {
  return useMemo(() => (url ? (getOfflineFileUri(url, folder) ?? url) : null), [url, folder]);
}
