import { useQuery } from '@tanstack/react-query';

import { getSpecies, listSpecies } from '../api';
import { type CategoryFilter, speciesKeys } from '../constants';

/** HU-10: listado por categoría. Con `all` no se filtra. */
export function useSpeciesList(category: CategoryFilter) {
  return useQuery({
    queryKey: speciesKeys.list(category),
    queryFn: () => listSpecies(category),
  });
}

/** HU-10: detalle de una ficha. */
export function useSpecies(id: string) {
  return useQuery({
    queryKey: speciesKeys.detail(id),
    queryFn: () => getSpecies(id),
  });
}
