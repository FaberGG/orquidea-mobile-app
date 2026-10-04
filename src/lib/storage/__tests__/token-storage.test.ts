import { deleteSecureItem, getSecureItem, setSecureItem } from '../secure-storage';
import { clearToken, getToken, saveToken } from '../token-storage';

jest.mock('../secure-storage', () => {
  const store = new Map<string, string>();
  return {
    getSecureItem: jest.fn(async (key: string) => store.get(key) ?? null),
    setSecureItem: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteSecureItem: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

const NOW = 1_000_000;

describe('token-storage', () => {
  beforeEach(async () => {
    await clearToken();
    jest.clearAllMocks();
  });

  it('guarda y recupera un token vigente', async () => {
    await saveToken({ token: 'jwt', expiresAt: NOW + 1000 });
    await expect(getToken(NOW)).resolves.toEqual({ token: 'jwt', expiresAt: NOW + 1000 });
  });

  it('devuelve null y borra el token si ya venció', async () => {
    await saveToken({ token: 'jwt', expiresAt: NOW - 1 });
    await expect(getToken(NOW)).resolves.toBeNull();
    expect(deleteSecureItem).toHaveBeenCalled();
  });

  it('devuelve null y borra el valor si el formato es inválido', async () => {
    await setSecureItem('orquidea.auth-token', 'no-es-json');
    await expect(getToken(NOW)).resolves.toBeNull();
    await expect(getSecureItem('orquidea.auth-token')).resolves.toBeNull();
  });

  it('devuelve null si no hay token guardado', async () => {
    await expect(getToken(NOW)).resolves.toBeNull();
  });
});
