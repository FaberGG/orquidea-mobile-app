import { type QueryClient } from '@tanstack/react-query';

import { registerOfflineQueries } from '@/lib/offline';

import { OFFLINE_SOURCES } from './constants';

/**
 * Marca como persistentes (`meta.persist`) las claves de todas las fuentes offline. Se llama una vez, antes de
 * montar `PersistQueryClientProvider`, para que también se guarden las entradas creadas con `setQueryData`.
 */
export function configureOfflineQueries(queryClient: QueryClient): void {
  for (const source of OFFLINE_SOURCES) {
    registerOfflineQueries(queryClient, source.queryKey);
  }
}
