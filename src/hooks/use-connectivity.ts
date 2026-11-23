import { useSyncExternalStore } from 'react';

import { type Connectivity, getConnectivity, subscribeConnectivity } from '@/lib/offline';

export type { Connectivity } from '@/lib/offline';

/**
 * Conectividad efectiva para la interfaz (HU-21): `offline` si no hay red o si el backend no respondió a la
 * última petición (fallo de red o tiempo agotado). `unknown` antes de la primera lectura: no bloquear por eso.
 */
export function useConnectivity(): Connectivity {
  return useSyncExternalStore(subscribeConnectivity, getConnectivity, getConnectivity);
}
