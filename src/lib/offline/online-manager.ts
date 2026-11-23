import { onlineManager } from '@tanstack/react-query';
import { addNetworkStateListener, getNetworkStateAsync, type NetworkState } from 'expo-network';
import { AppState } from 'react-native';

import { setNetworkStatus } from './connectivity';
import { toNetworkStatus } from './network-state';

let connected = false;

/**
 * Conecta el `onlineManager` de TanStack Query con `expo-network` (ADR-0017). Sin red confirmada las queries
 * quedan en pausa (`fetchStatus === 'paused'`) en lugar de fallar, y se reanudan al volver la conexión. Un
 * estado desconocido cuenta como en línea para no bloquear peticiones que podrían funcionar (ADR-0015).
 *
 * También informa la red a `connectivity` (estado que ve la interfaz) y vuelve a leerla cuando la app regresa
 * al primer plano: los avisos de cambio de red pueden perderse mientras está en segundo plano.
 *
 * Idempotente: llamarla varias veces no registra listeners duplicados.
 */
export function connectOnlineManager(): void {
  if (connected) return;
  connected = true;
  onlineManager.setEventListener((setOnline) => {
    const apply = (state: NetworkState) => {
      const status = toNetworkStatus(state);
      setNetworkStatus(status);
      setOnline(status !== 'offline');
    };
    const read = () =>
      getNetworkStateAsync()
        .then(apply)
        .catch(() => {
          setNetworkStatus('unknown');
          setOnline(true);
        });
    const subscription = addNetworkStateListener(apply);
    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active') void read();
    });
    void read();
    return () => {
      subscription.remove();
      appState.remove();
    };
  });
}
