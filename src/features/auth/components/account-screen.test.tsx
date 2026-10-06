import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { type ReactNode } from 'react';

import { handleForbidden } from '@/lib/api';
import { clearToken, getToken } from '@/lib/storage';
import { RoleProvider } from '@/permissions';

import { getMe } from '../api';
import { AUTH_LABELS, authKeys } from '../constants';
import { useSession } from '../hooks';
import { type User } from '../types';
import { AccountScreen } from './account-screen';
import { SessionProvider } from './session-provider';

jest.mock('expo-router', () => ({ router: { replace: jest.fn(), push: jest.fn() } }));
jest.mock('@/lib/storage', () => ({
  getToken: jest.fn(),
  saveToken: jest.fn(),
  clearToken: jest.fn(),
}));
jest.mock('../api', () => ({ getMe: jest.fn() }));

const SUPERADMIN: User = {
  id: '1',
  firstName: 'María',
  lastName: 'Solarte',
  email: 'maria@orquidea.local',
  role: 'superadmin',
};

let queryClient: QueryClient;

/** Conecta el rol de la sesión con los permisos, como hace AppProviders. */
function RoleFromSession({ children }: { children: ReactNode }) {
  const { role } = useSession();
  return <RoleProvider role={role}>{children}</RoleProvider>;
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <RoleFromSession>{children}</RoleFromSession>
      </SessionProvider>
    </QueryClientProvider>
  );
}

async function renderAccount(user: User | null) {
  jest
    .mocked(getToken)
    .mockResolvedValue(user ? { token: 'jwt', expiresAt: Date.now() + 60_000 } : null);
  if (user) jest.mocked(getMe).mockResolvedValue(user);
  await render(<AccountScreen />, { wrapper: Providers });
  await waitFor(() => expect(queryClient.getQueryState(authKeys.me())?.status).toBe('success'));
}

describe('AccountScreen (HU-3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { gcTime: Infinity },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('al visitante le ofrece iniciar sesión o registrarse', async () => {
    await renderAccount(null);

    expect(screen.getByText(AUTH_LABELS.loginButtonGuest)).toBeTruthy();
    expect(screen.queryByText(AUTH_LABELS.logoutButton)).toBeNull();
  });

  it('con sesión muestra los datos del usuario y su rol', async () => {
    await renderAccount(SUPERADMIN);

    expect(await screen.findByText('María Solarte')).toBeTruthy();
    expect(screen.getByText('Rol: Superadministrador')).toBeTruthy();
  });

  it('muestra el rol de un usuario registrado', async () => {
    await renderAccount({ ...SUPERADMIN, role: 'user' });

    expect(await screen.findByText('Rol: Usuario registrado')).toBeTruthy();
  });

  it('CA1: CERRAR SESIÓN borra el token, deja la sesión como visitante y va al inicio', async () => {
    await renderAccount(SUPERADMIN);
    queryClient.setQueryData(['species', 'list', 'bird'], ['dato del rol anterior']);

    await fireEvent.press(await screen.findByText(AUTH_LABELS.logoutButton));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
    expect(clearToken).toHaveBeenCalled();
    expect(queryClient.getQueryData(authKeys.me())).toBeNull();
    expect(queryClient.getQueryData(['species', 'list', 'bird'])).toBeUndefined();
    expect(await screen.findByText(AUTH_LABELS.loginButtonGuest)).toBeTruthy();
  });

  it('refresca el rol después de un 403 y elimina la caché del rol anterior', async () => {
    await renderAccount(SUPERADMIN);
    queryClient.setQueryData(['admins', 'list'], [{ id: 'privado' }]);
    jest.mocked(getMe).mockResolvedValue({ ...SUPERADMIN, role: 'user' });

    await act(async () => handleForbidden());

    expect(await screen.findByText('Rol: Usuario registrado')).toBeTruthy();
    expect(queryClient.getQueryData(['admins', 'list'])).toBeUndefined();
  });
});
