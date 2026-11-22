import { type QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';
import { type OfflineSource } from '@/lib/offline';

import { syncSpecies } from '../api';
import { LEGACY_SPECIES_LIST_KEY, speciesKeys } from '../constants';
import { type Species, type SpeciesCatalog, type SpeciesSync } from '../types';
import { applySpeciesSync, sortSpecies, speciesOfflinePhotoUrls } from '../utils/species-catalog';

/** Pide los cambios desde `cursor`. Si el servidor rechaza el cursor (`400`), descarga todo de nuevo. */
async function requestSync(cursor: string | null): Promise<SpeciesSync> {
  try {
    return await syncSpecies(cursor);
  } catch (error) {
    if (cursor && isApiError(error) && error.status === 400) return syncSpecies(null);
    throw error;
  }
}

/**
 * HU-21: actualiza la copia local de fichas con `GET /api/fichas-taxonomicas/sincronizacion`. La primera vez (o
 * si se perdió la copia) la descarga entera; después solo pide lo que cambió desde el cursor guardado. Siembra
 * el detalle de cada ficha recibida (`speciesKeys.detail(id)`) y quita el de las que ya no existen.
 *
 * Es la `queryFn` de `speciesKeys.catalog()`: no llamarla directamente, sino a través de esa query, para que dos
 * sincronizaciones simultáneas (pantalla y `OfflineSync`) se unan en una sola petición.
 */
export async function syncSpeciesCatalog(queryClient: QueryClient): Promise<SpeciesCatalog> {
  const current = queryClient.getQueryData<SpeciesCatalog>(speciesKeys.catalog());
  const sync = await requestSync(current?.syncedAt ?? null);
  const catalog = applySpeciesSync(current, sync);

  for (const item of sync.species) {
    queryClient.setQueryData(speciesKeys.detail(item.id), item);
  }
  const ids = new Set(catalog.species.map((item) => item.id));
  queryClient.removeQueries({
    queryKey: [...speciesKeys.all, 'detail'],
    predicate: (query) => !ids.has(String(query.queryKey[2])),
  });
  // La copia del formato anterior ya no hace falta.
  queryClient.removeQueries({ queryKey: LEGACY_SPECIES_LIST_KEY, exact: true });
  return catalog;
}

/** Opciones de la query de la copia local, compartidas por el listado y la sincronización offline. */
export function speciesCatalogQueryOptions(queryClient: QueryClient) {
  return {
    queryKey: speciesKeys.catalog(),
    queryFn: () => syncSpeciesCatalog(queryClient),
  };
}

/**
 * Copia guardada con el formato anterior (`Species[]` del listado completo), mientras no haya sincronizado la
 * versión nueva. Evita mostrar "no disponible sin conexión" si la app se actualizó y se abre sin red.
 */
export function getLegacySpeciesCatalog(queryClient: QueryClient): SpeciesCatalog | undefined {
  const legacy = queryClient.getQueryData<Species[]>(LEGACY_SPECIES_LIST_KEY);
  return legacy ? { syncedAt: null, species: sortSpecies(legacy) } : undefined;
}

/**
 * HU-21: sincroniza la copia local de fichas al abrir la app y al reconectar. Devuelve las URLs de las fotos de
 * todas las fichas (miniaturas del listado y fotos del detalle).
 */
export async function prefetchSpeciesForOffline(queryClient: QueryClient): Promise<string[]> {
  const catalog = await queryClient.fetchQuery({
    ...speciesCatalogQueryOptions(queryClient),
    staleTime: 0,
  });
  return speciesOfflinePhotoUrls(catalog.species);
}

/** Fuente offline de la feature de fichas (la registra `features/offline`). */
export const speciesOfflineSource: OfflineSource = {
  name: 'species',
  queryKey: speciesKeys.all,
  prefetch: prefetchSpeciesForOffline,
};
