import { apiClient } from '@/lib/api';

import { SPECIES_CATEGORY_FILTERS, type CategoryFilter } from '../constants';
import { type Species } from '../types';
import { toSpecies, toSpeciesList } from './species.mappers';

/**
 * HU-10: `GET /api/fichas-taxonomicas?categoria=`. Público (sin token) y sin paginación.
 * Sin categoría (`all`) no envía el parámetro.
 */
export async function listSpecies(category: CategoryFilter): Promise<Species[]> {
  const filter = SPECIES_CATEGORY_FILTERS.find((item) => item.id === category);
  const apiValue = filter && 'apiValue' in filter ? filter.apiValue : undefined;
  const response = await apiClient.get<unknown>('/api/fichas-taxonomicas', {
    query: { categoria: apiValue },
    authenticated: false,
  });
  return toSpeciesList(response);
}

/** HU-10 (detalle): `GET /api/fichas-taxonomicas/{id}`. `404` = la ficha no existe. */
export async function getSpecies(id: string): Promise<Species> {
  const response = await apiClient.get<unknown>(
    `/api/fichas-taxonomicas/${encodeURIComponent(id)}`,
    {
      authenticated: false,
    },
  );
  return toSpecies(response);
}
