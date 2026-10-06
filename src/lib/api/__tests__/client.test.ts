import { clearToken, getToken } from '@/lib/storage';

import { ApiError } from '../api-error';
import { setForbiddenHandler, setUnauthorizedHandler } from '../auth-interceptor';
import { apiClient } from '../client';

jest.mock('@/config', () => ({
  APP_CONFIG: { requestTimeoutMs: 50 },
  getEnv: () => ({ apiUrl: 'http://api.test', appEnv: 'development' }),
}));

jest.mock('@/lib/storage', () => ({
  getToken: jest.fn(),
  clearToken: jest.fn(),
}));

const mockedGetToken = jest.mocked(getToken);
const fetchMock = jest.fn();

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = fetchMock;
    mockedGetToken.mockResolvedValue(null);
  });

  it('envía JSON a la URL base y devuelve el cuerpo parseado', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

    await expect(apiClient.post('/api/x', { body: { a: 1 } })).resolves.toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/api/x');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('agrega los parámetros de consulta omitiendo los indefinidos', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, []));

    await apiClient.get('/api/fichas', { query: { categoria: 'AVE', pagina: undefined } });

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/fichas?categoria=AVE');
  });

  it('adjunta el token Bearer en peticiones autenticadas', async () => {
    mockedGetToken.mockResolvedValue({ token: 'abc', expiresAt: Date.now() + 1000 });
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await apiClient.get('/api/autenticacion/yo');

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer abc');
  });

  it('no adjunta el token en peticiones públicas', async () => {
    mockedGetToken.mockResolvedValue({ token: 'abc', expiresAt: Date.now() + 1000 });
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await apiClient.post('/api/login', { body: {}, authenticated: false });

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('devuelve undefined en respuestas sin cuerpo (204)', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiClient.post('/api/x', { body: {} })).resolves.toBeUndefined();
  });

  it('normaliza un ApiErrorResponse a ApiError con el mensaje del servidor', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, { estado: 400, error: 'Bad Request', mensaje: 'Mensaje para el usuario' }),
    );

    const error = await apiClient.post('/api/x', { body: {} }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      kind: 'http',
      serverMessage: 'Mensaje para el usuario',
    });
  });

  it('tolera errores con cuerpo vacío (docs/api B4)', async () => {
    fetchMock.mockResolvedValue(jsonResponse(409));

    await expect(apiClient.put('/api/x', { body: {} })).rejects.toMatchObject({
      status: 409,
      serverMessage: undefined,
    });
  });

  it('cierra la sesión ante un 401 en una petición autenticada', async () => {
    const onUnauthorized = jest.fn();
    const unregister = setUnauthorizedHandler(onUnauthorized);
    fetchMock.mockResolvedValue(jsonResponse(401));

    await expect(apiClient.get('/api/autenticacion/yo')).rejects.toMatchObject({ status: 401 });

    expect(clearToken).toHaveBeenCalled();
    expect(onUnauthorized).toHaveBeenCalled();
    unregister();
  });

  it('actualiza los permisos al recibir un 403 sin cerrar la sesión', async () => {
    const refreshPermissions = jest.fn();
    const unregister = setForbiddenHandler(refreshPermissions);
    fetchMock.mockResolvedValue(jsonResponse(403, { mensaje: 'No tiene permisos.' }));

    await expect(apiClient.get('/api/administradores')).rejects.toMatchObject({
      status: 403,
      serverMessage: 'No tiene permisos.',
    });

    expect(refreshPermissions).toHaveBeenCalledTimes(1);
    expect(clearToken).not.toHaveBeenCalled();
    unregister();
  });

  it('no cierra la sesión ante un 401 en una petición pública (credenciales incorrectas)', async () => {
    const onUnauthorized = jest.fn();
    const unregister = setUnauthorizedHandler(onUnauthorized);
    fetchMock.mockResolvedValue(jsonResponse(401, { mensaje: 'Correo o contraseña incorrectos.' }));

    await expect(
      apiClient.post('/api/login', { body: {}, authenticated: false }),
    ).rejects.toMatchObject({ status: 401, serverMessage: 'Correo o contraseña incorrectos.' });

    expect(clearToken).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
    unregister();
  });

  it('convierte un fallo de red en ApiError con status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(apiClient.get('/api/x')).rejects.toMatchObject({ status: 0, kind: 'network' });
  });

  it('aborta la petición al agotar el tiempo de espera', async () => {
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );

    await expect(apiClient.get('/api/x')).rejects.toMatchObject({ status: 0, kind: 'timeout' });
  });
});
