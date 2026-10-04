import { clearToken, getToken } from '@/lib/storage';

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Registra quién debe enterarse cuando una petición autenticada recibe `401` (token vencido o
 * inválido). La sesión lo registra al montarse; así `lib/` no depende de `features/auth`.
 * Devuelve una función para anular el registro.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): () => void {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

/** Devuelve el encabezado `Authorization` si hay un token vigente. */
export async function getAuthorizationHeader(): Promise<Record<string, string>> {
  const stored = await getToken();
  return stored ? { Authorization: `Bearer ${stored.token}` } : {};
}

/** Borra el token y avisa a la sesión. No hay renovación de token en la API. */
export async function handleUnauthorized(): Promise<void> {
  await clearToken();
  unauthorizedHandler?.();
}
