import { NetworkStateType, type NetworkState } from 'expo-network';

/** Conectividad tal como la entiende la app (ADR-0015 y ADR-0017). */
export type NetworkStatus = 'online' | 'offline' | 'unknown';

/**
 * Traduce el estado de `expo-network` a la regla de la app: solo `isConnected === false` con tipo `NONE` es
 * desconexión confirmada; la información incompleta se trata como desconocida y deja intentar la API.
 */
export function toNetworkStatus(state: NetworkState): NetworkStatus {
  if (state.isConnected === true) return 'online';
  if (state.isConnected === false && state.type === NetworkStateType.NONE) return 'offline';
  return 'unknown';
}
