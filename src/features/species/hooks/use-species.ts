import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getSpecies, listSpecies } from '../api';
import { type CategoryFilter, speciesKeys } from '../constants';
import { type Species } from '../types';

/**
 * HU-10: listado por categoría. Con `all` no se filtra.
 *
 * HU-21: las fichas se guardan en el dispositivo (`speciesOfflineSource`). Si la categoría elegida aún no
 * está en caché (p. ej. sin conexión), se muestra provisionalmente el listado completo guardado filtrado por
 * esa categoría hasta que llegue la respuesta de la API.
 */
export function useSpeciesList(category: CategoryFilter) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: speciesKeys.list(category),
    queryFn: () => listSpecies(category),
    placeholderData: () => {
      if (category === 'all') return undefined;
      const all = queryClient.getQueryData<Species[]>(speciesKeys.list('all'));
      return all?.filter((item) => item.category === category);
    },
  });
}

/** HU-10: detalle de una ficha. Sin conexión usa la copia guardada (HU-21). */
export function useSpecies(id: string) {
  return useQuery({
    queryKey: speciesKeys.detail(id),
    queryFn: ({ signal }) => getSpecies(id, { signal }),
  });
}
