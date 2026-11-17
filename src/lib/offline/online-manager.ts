import { onlineManager } from '@tanstack/react-query';
import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network';

import { toNetworkStatus } from './network-state';

let connected = false;

/**
 * Conecta el `onlineManager` de TanStack Query con `expo-network` (ADR-0017). Sin red confirmada las queries
 * quedan en pausa (`fetchStatus === 'paused'`) en lugar de fallar, y se reanudan al volver la conexión. Un
 * estado desconocido cuenta como en línea para no bloquear peticiones que podrían funcionar (ADR-0015).
 *
 * Idempotente: llamarla varias veces no registra listeners duplicados.
 */
export function connectOnlineManager(): void {
  if (connected) return;
  connected = true;
  onlineManager.setEventListener((setOnline) => {
    const subscription = addNetworkStateListener((state) => {
      setOnline(toNetworkStatus(state) !== 'offline');
    });
    getNetworkStateAsync()
      .then((state) => setOnline(toNetworkStatus(state) !== 'offline'))
      .catch(() => setOnline(true));
    return () => subscription.remove();
  });
}
