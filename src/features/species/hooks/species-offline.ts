import { type QueryClient } from '@tanstack/react-query';

import { type OfflineSource } from '@/lib/offline';

import { listSpecies } from '../api';
import { speciesKeys } from '../constants';

/**
 * HU-21: descarga todas las fichas para consultarlas sin conexión. El listado sin filtro trae las fichas
 * completas, así que con una sola petición se siembra también el detalle de cada una
 * (`speciesKeys.detail(id)`). Devuelve las URLs de todas sus fotos.
 *
 * Cuando el backend entregue el endpoint de sincronización (SCRUM-64) solo cambia esta función.
 */
export async function prefetchSpeciesForOffline(queryClient: QueryClient): Promise<string[]> {
  const species = await queryClient.fetchQuery({
    queryKey: speciesKeys.list('all'),
    queryFn: () => listSpecies('all'),
    staleTime: 0,
  });
  for (const item of species) {
    queryClient.setQueryData(speciesKeys.detail(item.id), item);
  }
  // Las fichas eliminadas en el servidor dejan de estar disponibles sin conexión.
  const ids = new Set(species.map((item) => item.id));
  queryClient.removeQueries({
    queryKey: [...speciesKeys.all, 'detail'],
    predicate: (query) => !ids.has(String(query.queryKey[2])),
  });
  return species.flatMap((item) => item.photos.map((photo) => photo.url));
}

/** Fuente offline de la feature de fichas (la registra `features/offline`). */
export const speciesOfflineSource: OfflineSource = {
  name: 'species',
  queryKey: speciesKeys.all,
  prefetch: prefetchSpeciesForOffline,
};
