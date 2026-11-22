import { useSyncExternalStore } from 'react';

import {
  getOfflineSyncStatus,
  type OfflineSyncStatus,
  subscribeOfflineSyncStatus,
} from '@/lib/offline';

export type { OfflineSyncStatus } from '@/lib/offline';

/** Estado de la sincronización de la copia offline (fase, progreso de fotos y última actualización). */
export function useOfflineSyncStatus(): OfflineSyncStatus {
  return useSyncExternalStore(
    subscribeOfflineSyncStatus,
    getOfflineSyncStatus,
    getOfflineSyncStatus,
  );
}

const getFilesVersion = () => getOfflineSyncStatus().filesVersion;

/**
 * Número que cambia cada vez que se guardan o borran archivos offline. Para recalcular qué está descargado sin
 * volver a renderizar con cada foto procesada.
 */
export function useOfflineFilesVersion(): number {
  return useSyncExternalStore(subscribeOfflineSyncStatus, getFilesVersion, getFilesVersion);
}
