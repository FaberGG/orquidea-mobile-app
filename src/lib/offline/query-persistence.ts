import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { type Query, type QueryClient, type QueryKey } from '@tanstack/react-query';

import { keyValueStorage } from './offline-storage';

/** Tiempo máximo que se conserva la caché offline sin refrescarse (30 días). */
export const OFFLINE_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Versión del formato persistido. Cambiarla descarta la caché guardada en los dispositivos: subirla cuando un
 * modelo persistido cambie de forma incompatible (p. ej. el modelo Darwin Core de SCRUM-61/62).
 */
export const OFFLINE_CACHE_BUSTER = 'orquidea-offline-v1';

const QUERY_CACHE_KEY = 'orquidea.query-cache';

/**
 * Opciones de una query que debe quedar disponible sin conexión.
 *
 * `gcTime: Infinity`: la entrada no se borra de memoria mientras exista la copia guardada. Un valor finito
 * mayor que ~24,8 días desborda `setTimeout` y la borraría al instante; por eso no se usa `maxAge`. Las
 * entradas obsoletas (p. ej. fichas eliminadas) las quita la propia fuente al sincronizar.
 */
export const offlineQueryOptions = {
  meta: { persist: true },
  gcTime: Infinity,
} as const;

/** Persister de TanStack Query sobre `keyValueStorage`. Guarda como mucho una vez por segundo. */
export const queryPersister = createAsyncStoragePersister({
  storage: keyValueStorage,
  key: QUERY_CACHE_KEY,
  throttleTime: 1000,
});

/** `true` si la query está marcada para guardarse en el dispositivo (`meta.persist`). */
export function isPersistedQuery(query: Pick<Query, 'meta'>): boolean {
  return query.meta?.persist === true;
}

/** Filtro de `dehydrateOptions`: solo queries marcadas y con datos válidos. */
export function shouldPersistQuery(query: Query): boolean {
  return isPersistedQuery(query) && query.state.status === 'success';
}

/**
 * Marca como offline todas las queries que empiecen por `queryKey` (p. ej. `speciesKeys.all`), incluidas las
 * creadas con `setQueryData`. Llamarla antes de montar la app (ver `features/offline`).
 */
export function registerOfflineQueries(queryClient: QueryClient, queryKey: QueryKey): void {
  queryClient.setQueryDefaults(queryKey, offlineQueryOptions);
}

/** Opciones para `PersistQueryClientProvider`. */
export const queryPersistOptions = {
  persister: queryPersister,
  maxAge: OFFLINE_CACHE_MAX_AGE_MS,
  buster: OFFLINE_CACHE_BUSTER,
  dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
};
