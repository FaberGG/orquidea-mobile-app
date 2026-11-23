import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, waitFor } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import { ApiError } from '@/lib/api';
import { registerOfflineQueries } from '@/lib/offline';
import { clearToken, getToken } from '@/lib/storage';

import { getMe } from '../api';
import { authKeys } from '../constants';
import { useSession } from '../hooks';
import { type User } from '../types';
import { SessionProvider } from './session-provider';

// Almacenamiento seguro en memoria: lo usa el usuario guardado para abrir la app sin conexión.
const mockSecureItems = new Map<string, string>();
jest.mock('@/lib/storage', () => ({
  getToken: jest.fn(),
  saveToken: jest.fn(),
  clearToken: jest.fn(),
  getSecureItem: jest.fn(async (key: string) => mockSecureItems.get(key) ?? null),
  setSecureItem: jest.fn(async (key: string, value: string) => {
    mockSecureItems.set(key, value);
  }),
  deleteSecureItem: jest.fn(async (key: string) => {
    mockSecureItems.delete(key);
  }),
}));
jest.mock('../api', () => ({ getMe: jest.fn() }));

const ADMIN: User = {
  id: '1',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@orquidea.local',
  role: 'admin',
};

let signOut: () => Promise<void>;

function Probe() {
  const session = useSession();
  useEffect(() => {
    signOut = session.signOut;
  }, [session.signOut]);
  return null;
}

describe('SessionProvider y datos offline (HU-21)', () => {
  it('al cerrar sesión borra los datos de la cuenta pero conserva los guardados para uso offline', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    registerOfflineQueries(queryClient, ['species']);
    jest.mocked(getToken).mockResolvedValue({ token: 'jwt', expiresAt: Date.now() + 60_000 });
    jest.mocked(getMe).mockResolvedValue(ADMIN);

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <SessionProvider>{children}</SessionProvider>
        </QueryClientProvider>
      );
    }
    await render(<Probe />, { wrapper: Wrapper });
    await waitFor(() => expect(queryClient.getQueryData(authKeys.me())).toEqual(ADMIN));

    queryClient.setQueryData(['species', 'list', 'all'], [{ id: 'ave-1' }]);
    queryClient.setQueryData(['admins', 'list'], [{ id: 'a' }]);

    await act(() => signOut());

    expect(queryClient.getQueryData(['species', 'list', 'all'])).toEqual([{ id: 'ave-1' }]);
    expect(queryClient.getQueryData(['admins', 'list'])).toBeUndefined();
    expect(queryClient.getQueryData(authKeys.me())).toBeNull();
    queryClient.clear();
  });
});

describe('SessionProvider sin conexión al abrir la app (HU-21)', () => {
  const VALID_TOKEN = { token: 'jwt', expiresAt: Date.now() + 60_000 };
  const NETWORK_ERROR = new ApiError({ status: 0, kind: 'network', path: '/api/autenticacion/yo' });
  let session: ReturnType<typeof useSession> | undefined;

  function SessionProbe() {
    const current = useSession();
    useEffect(() => {
      session = current;
    }, [current]);
    return null;
  }

  async function renderSession() {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <SessionProbe />
        </SessionProvider>
      </QueryClientProvider>,
    );
    return queryClient;
  }

  /** Simula un inicio de sesión anterior con conexión: el usuario quedó guardado en el dispositivo. */
  function seedSavedUser(user: User) {
    mockSecureItems.set('orquidea.session-user', JSON.stringify(user));
  }

  beforeEach(() => {
    session = undefined;
    mockSecureItems.clear();
    jest.clearAllMocks();
    onlineManager.setOnline(false);
  });
  afterEach(async () => {
    // Desmontar antes de restaurar la red: si no, una sesión aún montada intentaría confirmarse con la API.
    await cleanup();
    onlineManager.setOnline(true);
  });

  it('sin token no se queda cargando (la splash se oculta) y entra como visitante', async () => {
    jest.mocked(getToken).mockResolvedValue(null);
    const queryClient = await renderSession();

    await waitFor(() => expect(session?.status).toBe('guest'));
    queryClient.clear();
  });

  it('al iniciar sesión guarda el usuario en el dispositivo', async () => {
    onlineManager.setOnline(true);
    jest.mocked(getToken).mockResolvedValue(null);
    const queryClient = await renderSession();
    await waitFor(() => expect(session?.status).toBe('guest'));

    await act(() => session?.signIn({ token: VALID_TOKEN, user: ADMIN }));

    expect(session?.status).toBe('authenticated');
    expect(JSON.parse(mockSecureItems.get('orquidea.session-user') ?? 'null')).toEqual(ADMIN);
    queryClient.clear();
  });

  it('con token pero sin usuario guardado entra como visitante y conserva el token', async () => {
    jest.mocked(getToken).mockResolvedValue(VALID_TOKEN);
    jest.mocked(getMe).mockRejectedValue(NETWORK_ERROR);
    const queryClient = await renderSession();

    await waitFor(() => expect(session?.status).toBe('guest'));
    expect(clearToken).not.toHaveBeenCalled();
    queryClient.clear();
  });

  it('con token y usuario guardado mantiene la sesión iniciada sin conexión', async () => {
    seedSavedUser(ADMIN);
    jest.mocked(getToken).mockResolvedValue(VALID_TOKEN);
    jest.mocked(getMe).mockRejectedValue(NETWORK_ERROR);
    const queryClient = await renderSession();

    await waitFor(() => expect(session?.status).toBe('authenticated'));
    expect(session?.user).toEqual(ADMIN);
    expect(session?.role).toBe('admin');
    queryClient.clear();
  });

  it('al volver la conexión confirma la sesión con la API y aplica el rol vigente', async () => {
    seedSavedUser(ADMIN);
    jest.mocked(getToken).mockResolvedValue(VALID_TOKEN);
    jest.mocked(getMe).mockRejectedValueOnce(NETWORK_ERROR);
    const queryClient = await renderSession();
    await waitFor(() => expect(session?.status).toBe('authenticated'));

    jest.mocked(getMe).mockResolvedValueOnce({ ...ADMIN, role: 'user' });
    await act(async () => {
      onlineManager.setOnline(true);
    });

    await waitFor(() => expect(session?.role).toBe('user'));
    queryClient.clear();
  });

  it('con el token vencido no usa el usuario guardado y lo borra', async () => {
    seedSavedUser(ADMIN);
    jest.mocked(getToken).mockResolvedValue(null);
    const queryClient = await renderSession();

    await waitFor(() => expect(session?.status).toBe('guest'));
    expect(mockSecureItems.size).toBe(0);
    queryClient.clear();
  });

  it('al cerrar sesión borra el usuario guardado', async () => {
    seedSavedUser(ADMIN);
    jest.mocked(getToken).mockResolvedValue(VALID_TOKEN);
    jest.mocked(getMe).mockRejectedValue(NETWORK_ERROR);
    const queryClient = await renderSession();
    await waitFor(() => expect(session?.status).toBe('authenticated'));

    await act(() => session?.signOut());

    expect(session?.status).toBe('guest');
    expect(mockSecureItems.size).toBe(0);
    queryClient.clear();
  });
});
