import { type QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';
import { reportBackendReachable, reportBackendUnreachable } from '@/lib/offline';

/** `true`/`false` si el resultado dice algo sobre el backend; `null` si no (p. ej. un error de validación). */
function reachabilityOf(action: {
  type: string;
  error?: unknown;
  manual?: boolean;
}): boolean | null {
  if (action.type === 'success') return action.manual ? null : true;
  if (action.type === 'error' && isApiError(action.error)) return action.error.kind === 'http';
  return null;
}

/**
 * HU-21: observa las queries y mutaciones para saber si el backend responde. Un fallo por red o por tiempo
 * agotado marca el backend como inalcanzable ("sin conexión" en la interfaz aunque haya red); cualquier
 * respuesta lo vuelve a marcar como alcanzable. Los `setQueryData` (`manual`) no cuentan.
 *
 * Se llama una vez en `AppProviders`. Devuelve la función para dejar de observar.
 */
export function watchBackendReachability(queryClient: QueryClient): () => void {
  const report = (reachable: boolean | null) => {
    if (reachable === true) reportBackendReachable();
    if (reachable === false) reportBackendUnreachable();
  };
  const unsubscribeQueries = queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated') report(reachabilityOf(event.action));
  });
  const unsubscribeMutations = queryClient.getMutationCache().subscribe((event) => {
    if (event.type === 'updated') report(reachabilityOf(event.action));
  });
  return () => {
    unsubscribeQueries();
    unsubscribeMutations();
  };
}
