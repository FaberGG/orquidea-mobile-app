import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network';
import { useCallback, useEffect, useRef, useState } from 'react';

import { toNetworkStatus, type NetworkStatus } from '@/lib/offline';

export type { NetworkStatus } from '@/lib/offline';

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
