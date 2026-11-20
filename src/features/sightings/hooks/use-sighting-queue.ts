import { useEffect, useSyncExternalStore } from 'react';

import {
  getSightingQueueState,
  loadSightingQueue,
  subscribeSightingQueue,
  type QueuedSighting,
  type SightingQueueState,
} from '../queue';

/** HU-22: estado de la cola de reportes guardados en el teléfono (se carga del kv-store al montar). */
export function useSightingQueueState(): SightingQueueState {
  const state = useSyncExternalStore(
    subscribeSightingQueue,
    getSightingQueueState,
    getSightingQueueState,
  );
  useEffect(() => {
    void loadSightingQueue();
  }, []);
  return state;
}

/** Reportes sin enviar de un usuario, del más antiguo al más reciente. */
export function useQueuedSightings(ownerId: string | undefined): readonly QueuedSighting[] {
  const { items } = useSightingQueueState();
  return ownerId ? items.filter((item) => item.ownerId === ownerId) : [];
}
