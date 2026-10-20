import {
  addNetworkStateListener,
  getNetworkStateAsync,
  NetworkStateType,
  type NetworkState,
} from 'expo-network';
import { useCallback, useEffect, useRef, useState } from 'react';

export type NetworkStatus = 'online' | 'offline' | 'unknown';

function toNetworkStatus(state: NetworkState): NetworkStatus {
  if (state.isConnected === true) return 'online';
  if (state.isConnected === false && state.type === NetworkStateType.NONE) return 'offline';
  return 'unknown';
}

/** Observa la conectividad sin convertirla en requisito global para las consultas de la app. */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>('unknown');
  const statusRef = useRef<NetworkStatus>('unknown');
  const eventVersion = useRef(0);
  const refreshVersion = useRef(0);
  const mounted = useRef(false);

  const refresh = useCallback(async (): Promise<NetworkStatus> => {
    const requestedAtVersion = eventVersion.current;
    const requestedRefresh = ++refreshVersion.current;
    try {
      const state = await getNetworkStateAsync();
      const nextStatus = toNetworkStatus(state);
      const stillCurrent =
        eventVersion.current === requestedAtVersion && refreshVersion.current === requestedRefresh;
      if (mounted.current && stillCurrent) {
        statusRef.current = nextStatus;
        setStatus(nextStatus);
      }
      return stillCurrent ? nextStatus : statusRef.current;
    } catch {
      const stillCurrent =
        eventVersion.current === requestedAtVersion && refreshVersion.current === requestedRefresh;
      if (mounted.current && stillCurrent) {
        statusRef.current = 'unknown';
        setStatus('unknown');
      }
      return stillCurrent ? 'unknown' : statusRef.current;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const subscription = addNetworkStateListener((state) => {
      eventVersion.current += 1;
      refreshVersion.current += 1;
      statusRef.current = toNetworkStatus(state);
      setStatus(statusRef.current);
    });
    void Promise.resolve().then(refresh);

    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [refresh]);

  return { status, refresh };
}
