import { useEffect, useState } from 'react';

import { getOfflineTilesUri, toPmtilesUrl } from '../utils/offline-tiles';

export type OfflineTilesState =
  { status: 'loading' } | { status: 'ready'; url: string } | { status: 'error' };

/**
 * SCRUM-85: URL `pmtiles://file:///…` del mapa base offline incluido en la app, lista para la fuente
 * vectorial de MapLibre. La usan el selector de ubicación (sin conexión) y el cambio automático de fuente
 * del mapa (tarea 5 del plan). Con `enabled = false` no prepara nada.
 */
export function useOfflineTiles(enabled = true): OfflineTilesState {
  const [state, setState] = useState<OfflineTilesState>({ status: 'loading' });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    getOfflineTilesUri()
      .then((uri) => {
        if (active) setState({ status: 'ready', url: toPmtilesUrl(uri) });
      })
      .catch((error: unknown) => {
        if (__DEV__) console.warn('[mapa offline] no se pudo preparar el PMTiles', error);
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return state;
}
