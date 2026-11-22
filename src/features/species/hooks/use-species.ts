import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { getSpecies } from '../api';
import { type CategoryFilter, speciesKeys } from '../constants';
import { type SpeciesCatalog } from '../types';
import { getLegacySpeciesCatalog, speciesCatalogQueryOptions } from './species-offline';
import { filterSpeciesByCategory } from '../utils/species-catalog';

/**
 * HU-10: listado por categoría. Con `all` no se filtra.
 *
 * HU-21: se lee siempre de la copia local de fichas (`speciesKeys.catalog()`), en línea y sin conexión, y la
 * categoría se filtra en el dispositivo. Al montarse sincroniza solo lo que cambió desde la última vez.
 */
export function useSpeciesList(category: CategoryFilter) {
  const queryClient = useQueryClient();
  const select = useCallback(
    (catalog: SpeciesCatalog) => filterSpeciesByCategory(catalog.species, category),
    [category],
  );
  return useQuery({
    ...speciesCatalogQueryOptions(queryClient),
    select,
    placeholderData: () => getLegacySpeciesCatalog(queryClient),
  });
}

/** HU-10: detalle de una ficha. Sin conexión usa la copia guardada (HU-21). */
export function useSpecies(id: string) {
  return useQuery({
    queryKey: speciesKeys.detail(id),
    queryFn: ({ signal }) => getSpecies(id, { signal }),
  });
}
