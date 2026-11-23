import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { type Query, type QueryClient, type QueryKey } from '@tanstack/react-query';
import { type PersistedClient, type Persister } from '@tanstack/react-query-persist-client';

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

const storagePersister = createAsyncStoragePersister({
  storage: keyValueStorage,
  key: QUERY_CACHE_KEY,
  throttleTime: 1000,
});

/**
 * Una query con datos cuyo último refresco falló (p. ej. sin backend) se guarda como `success` con esos datos:
 * el fallo es de esta sesión y no debe acompañar a la copia al reiniciar la app.
 */
export function clearRefreshErrors(client: PersistedClient): PersistedClient {
  return {
    ...client,
    clientState: {
      ...client.clientState,
      queries: client.clientState.queries.map((query) =>
        query.state.status === 'error' && query.state.data !== undefined
          ? {
              ...query,
              state: {
                ...query.state,
                status: 'success',
                error: null,
                fetchFailureCount: 0,
                fetchFailureReason: null,
              },
            }
          : query,
      ),
    },
  };
}

/** Persister de TanStack Query sobre `keyValueStorage`. Guarda como mucho una vez por segundo. */
export const queryPersister: Persister = {
  ...storagePersister,
  persistClient: (client) => storagePersister.persistClient(clearRefreshErrors(client)),
};

/** `true` si la query está marcada para guardarse en el dispositivo (`meta.persist`). */
export function isPersistedQuery(query: Pick<Query, 'meta'>): boolean {
  return query.meta?.persist === true;
}

/**
 * Filtro de `dehydrateOptions`: solo queries marcadas y con datos. También las que conservan datos aunque su
 * último refresco haya fallado (sin backend, tiempo agotado): si no, la copia offline se perdería al cerrar la
 * app tras un intento de sincronización fallido.
 */
export function shouldPersistQuery(query: Query): boolean {
  return isPersistedQuery(query) && query.state.data !== undefined;
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
