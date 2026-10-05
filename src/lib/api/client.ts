import { APP_CONFIG, getEnv } from '@/config';

import { ApiError, readServerMessage } from './api-error';
import { getAuthorizationHeader, handleUnauthorized } from './auth-interceptor';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  /** Cuerpo JSON. Se ignora si se envía `formData`. */
  body?: unknown;
  /** Cuerpo `multipart/form-data` (fichas con foto). */
  formData?: FormData;
  /** Parámetros de consulta; los valores `undefined` se omiten. */
  query?: Record<string, string | number | boolean | undefined>;
  /**
   * Si la petición adjunta el token y trata un `401` como sesión vencida. Por defecto `true`;
   * usar `false` en endpoints públicos (p. ej. iniciar sesión, donde `401` es "credenciales incorrectas").
   */
  authenticated?: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
};

function buildUrl(path: string, query: RequestOptions['query']): string {
  const url = `${getEnv().apiUrl}${path}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return params.length > 0 ? `${url}?${params.join('&')}` : url;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    // Cuerpo no JSON (p. ej. HTML de un proxy): se devuelve tal cual para no perder información.
    return text;
  }
}

/**
 * Ejecuta una petición contra la API y devuelve el cuerpo ya parseado.
 * Lanza `ApiError` ante respuestas no exitosas, fallos de red o tiempo agotado.
 */
export async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    formData,
    query,
    authenticated = true,
    timeoutMs = APP_CONFIG.requestTimeoutMs,
    signal,
  } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (authenticated) Object.assign(headers, await getAuthorizationHeader());
  const hasJsonBody = formData === undefined && body !== undefined;
  // Con FormData no se fija Content-Type: fetch agrega el boundary del multipart.
  if (hasJsonBody) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: formData ?? (hasJsonBody ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (cause) {
    throw new ApiError({ status: 0, kind: timedOut ? 'timeout' : 'network', path, cause });
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }

  const data = await readBody(response);

  if (!response.ok) {
    if (response.status === 401 && authenticated) await handleUnauthorized();
    throw new ApiError({
      status: response.status,
      kind: 'http',
      path,
      serverMessage: readServerMessage(data),
      body: data,
    });
  }

  return data as T;
}

/** Cliente HTTP de la app. Las features construyen sus funciones `*.api.ts` sobre él. */
export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body' | 'formData'>) =>
    request<T>('GET', path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>('POST', path, options),
  put: <T>(path: string, options?: RequestOptions) => request<T>('PUT', path, options),
  patch: <T>(path: string, options?: RequestOptions) => request<T>('PATCH', path, options),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'body' | 'formData'>) =>
    request<T>('DELETE', path, options),
};
