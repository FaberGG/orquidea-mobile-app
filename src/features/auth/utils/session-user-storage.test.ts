import { type User } from '../types';
import { clearSessionUser, getSessionUser, saveSessionUser } from './session-user-storage';

const mockSecureItems = new Map<string, string>();
jest.mock('@/lib/storage', () => ({
  getSecureItem: jest.fn(async (key: string) => mockSecureItems.get(key) ?? null),
  setSecureItem: jest.fn(async (key: string, value: string) => {
    mockSecureItems.set(key, value);
  }),
  deleteSecureItem: jest.fn(async (key: string) => {
    mockSecureItems.delete(key);
  }),
}));

const USER: User = {
  id: '7',
  firstName: 'Ana',
  lastName: 'Gómez',
  email: 'ana@orquidea.local',
  role: 'user',
};

beforeEach(() => mockSecureItems.clear());

describe('session-user-storage', () => {
  it('guarda y lee el usuario confirmado', async () => {
    await saveSessionUser(USER);
    await expect(getSessionUser()).resolves.toEqual(USER);
  });

  it('guarda solo los campos de User', async () => {
    await saveSessionUser({ ...USER, token: 'no-debe-guardarse' } as User);
    expect(JSON.parse([...mockSecureItems.values()][0])).toEqual(USER);
  });

  it('sin usuario guardado devuelve null', async () => {
    await expect(getSessionUser()).resolves.toBeNull();
  });

  it.each([
    ['JSON inválido', '{no-json'],
    ['rol desconocido', JSON.stringify({ ...USER, role: 'visitor' })],
    ['campos faltantes', JSON.stringify({ id: '7' })],
  ])('descarta y borra un valor inválido (%s)', async (_caso, raw) => {
    mockSecureItems.set('orquidea.session-user', raw);
    await expect(getSessionUser()).resolves.toBeNull();
    expect(mockSecureItems.size).toBe(0);
  });

  it('clearSessionUser borra el usuario', async () => {
    await saveSessionUser(USER);
    await clearSessionUser();
    await expect(getSessionUser()).resolves.toBeNull();
  });
});
