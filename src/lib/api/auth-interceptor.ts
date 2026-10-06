import { clearToken, getToken } from '@/lib/storage';

type UnauthorizedHandler = () => void;
type ForbiddenHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let forbiddenHandler: ForbiddenHandler | null = null;
let permissionRefresh: Promise<void> | null = null;

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

/** Registra la actualización de la sesión cuando una respuesta 403 puede indicar un rol obsoleto. */
export function setForbiddenHandler(handler: ForbiddenHandler | null): () => void {
  forbiddenHandler = handler;
  return () => {
    if (forbiddenHandler === handler) forbiddenHandler = null;
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

/** Comparte una sola consulta de sesión cuando varias solicitudes reciben 403 juntas. */
export async function handleForbidden(): Promise<void> {
  if (!forbiddenHandler) return;
  if (!permissionRefresh) {
    permissionRefresh = Promise.resolve()
      .then(() => forbiddenHandler?.())
      .then(() => undefined)
      .finally(() => {
        permissionRefresh = null;
      });
  }
  await permissionRefresh;
}
