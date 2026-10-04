/** Origen del error: respuesta HTTP de la API, fallo de red o tiempo de espera agotado. */
export type ApiErrorKind = 'http' | 'network' | 'timeout';

type ApiErrorOptions = {
  status: number;
  kind: ApiErrorKind;
  path: string;
  serverMessage?: string;
  cause?: unknown;
};

/**
 * Error normalizado de cualquier petición a la API (ver ARQUITECTURA §4 y CODIGO §10).
 * - `status`: código HTTP; `0` si no hubo respuesta (red o timeout).
 * - `serverMessage`: campo `mensaje` del `ApiErrorResponse`, redactado para el usuario. Puede faltar
 *   (cuerpo vacío o esquema distinto, ver docs/api B4).
 * - `message`: descripción técnica para depurar; nunca se muestra al usuario.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly path: string;
  readonly serverMessage: string | undefined;

  constructor({ status, kind, path, serverMessage, cause }: ApiErrorOptions) {
    super(`ApiError ${kind} ${status} en ${path}`, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.path = path;
    this.serverMessage = serverMessage;
  }
}

/** Indica si un valor desconocido es un `ApiError`. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Extrae `mensaje` de un cuerpo `ApiErrorResponse`, tolerando cuerpos vacíos o inesperados. */
export function readServerMessage(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null || !('mensaje' in body)) return undefined;
  const { mensaje } = body;
  return typeof mensaje === 'string' && mensaje.trim().length > 0 ? mensaje : undefined;
}
