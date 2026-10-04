import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode } from 'react';

import { ApiError } from '@/lib/api';
import { getToken, saveToken } from '@/lib/storage';

import { login } from '../api';
import { AUTH_MESSAGES, authKeys } from '../constants';
import { type LoginResult } from '../types';
import { LoginScreen } from './login-screen';
import { SessionProvider } from './session-provider';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
}));
jest.mock('@/lib/storage', () => ({
  getToken: jest.fn(),
  saveToken: jest.fn(),
  clearToken: jest.fn(),
}));
jest.mock('../api', () => ({ login: jest.fn(), getMe: jest.fn() }));

const mockedLogin = jest.mocked(login);

const LOGIN_RESULT: LoginResult = {
  token: { token: 'jwt', expiresAt: Date.now() + 60_000 },
  user: {
    id: '1',
    firstName: 'María',
    lastName: 'Pérez',
    email: 'maria@orquidea.local',
    role: 'admin',
  },
};

let queryClient: QueryClient;

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}

async function renderLogin() {
  await render(<LoginScreen />, { wrapper: Providers });
  // Espera a que termine la restauración de la sesión (sin token guardado → visitante).
  await waitFor(() => expect(queryClient.getQueryState(authKeys.me())?.status).toBe('success'));
}

async function fillAndSubmit(email: string, password: string) {
  await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), email);
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), password);
  await fireEvent.press(screen.getByText('INGRESAR'));
}

describe('LoginScreen (HU-1)', () => {
  afterEach(() => {
    queryClient.clear();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Sin parámetros de ruta por defecto: algunas pruebas simulan volver del registro o del cambio
    // de contraseña.
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    // gcTime infinito: evita timers pendientes que impiden que Jest termine al desmontar.
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { gcTime: Infinity },
      },
    });
    jest.mocked(getToken).mockResolvedValue(null);
  });

  it('CA1: con credenciales correctas guarda la sesión y va al inicio', async () => {
    mockedLogin.mockResolvedValue(LOGIN_RESULT);
    await renderLogin();

    await fillAndSubmit(' maria@orquidea.local ', 'Clave123');

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
    expect(mockedLogin).toHaveBeenCalledWith({
      email: 'maria@orquidea.local',
      password: 'Clave123',
    });
    expect(saveToken).toHaveBeenCalledWith(LOGIN_RESULT.token);
    expect(queryClient.getQueryData(authKeys.me())).toEqual(LOGIN_RESULT.user);
  });

  it('CA2: con credenciales incorrectas muestra "Correo o contraseña incorrectos."', async () => {
    mockedLogin.mockRejectedValue(
      new ApiError({
        status: 401,
        kind: 'http',
        path: '/api/autenticacion/iniciar-sesion',
        serverMessage: 'Correo o contraseña incorrectos.',
      }),
    );
    await renderLogin();

    await fillAndSubmit('maria@orquidea.local', 'mala');

    expect(await screen.findByText(AUTH_MESSAGES.invalidCredentials)).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it.each([
    ['ambos campos vacíos', '', ''],
    ['sin correo', '', 'Clave123'],
    ['sin contraseña', 'maria@orquidea.local', ''],
  ])(
    'CA3: con %s muestra "Ambos campos son obligatorios." sin llamar a la API',
    async (_c, email, password) => {
      await renderLogin();

      await fillAndSubmit(email, password);

      expect(await screen.findByText(AUTH_MESSAGES.requiredFields)).toBeTruthy();
      expect(screen.getAllByText(AUTH_MESSAGES.requiredFields)).toHaveLength(1);
      expect(mockedLogin).not.toHaveBeenCalled();
    },
  );

  it('CA4: el enlace "¿Olvidaste tu contraseña?" lleva a la recuperación', async () => {
    await renderLogin();

    await fireEvent.press(screen.getByText('¿Olvidaste tu contraseña?'));

    expect(router.push).toHaveBeenCalledWith('/forgot-password');
  });

  it('el enlace "Registrarse" lleva al registro', async () => {
    await renderLogin();

    await fireEvent.press(screen.getByText('Registrarse'));

    expect(router.push).toHaveBeenCalledWith('/register');
  });

  it('HU-2 CA1: al volver del registro muestra la confirmación', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ registered: 'true' });
    await renderLogin();

    expect(screen.getByText(AUTH_MESSAGES.registerSuccess)).toBeTruthy();
  });

  it('HU-1.1: al volver de restablecer la contraseña muestra la confirmación', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ passwordReset: 'true' });
    await renderLogin();

    expect(screen.getByText(AUTH_MESSAGES.passwordResetSuccess)).toBeTruthy();
  });

  it('sin conexión muestra el mensaje de respaldo', async () => {
    mockedLogin.mockRejectedValue(
      new ApiError({ status: 0, kind: 'network', path: '/api/autenticacion/iniciar-sesion' }),
    );
    await renderLogin();

    await fillAndSubmit('maria@orquidea.local', 'Clave123');

    expect(await screen.findByText(AUTH_MESSAGES.networkError)).toBeTruthy();
  });
});
