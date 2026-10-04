import { QueryClient } from '@tanstack/react-query';

const MAX_QUERY_RETRIES = 2;

function hasClientErrorStatus(error: unknown): boolean {
  // Se lee `status` de forma estructural para no acoplar esta capa al cliente HTTP.
  if (typeof error !== 'object' || error === null || !('status' in error)) return false;
  const { status } = error;
  return typeof status === 'number' && status >= 400 && status < 500;
}

/**
 * Crea el `QueryClient` de la app (ADR-0003).
 * - No reintenta errores `4xx` (reintentar no cambia la respuesta).
 * - Las mutaciones nunca se reintentan automáticamente.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failureCount, error) =>
          !hasClientErrorStatus(error) && failureCount < MAX_QUERY_RETRIES,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/** Instancia única usada por la app. */
export const queryClient = createQueryClient();
