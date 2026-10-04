import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode } from 'react';

import { ApiError } from '@/lib/api';

import { requestPasswordReset, resetPassword } from '../api';
import { AUTH_LABELS, AUTH_MESSAGES } from '../constants';
import { ForgotPasswordScreen } from './forgot-password-screen';
import { ResetPasswordScreen } from './reset-password-screen';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
}));
jest.mock('../api', () => ({ requestPasswordReset: jest.fn(), resetPassword: jest.fn() }));

let queryClient: QueryClient;

function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

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

describe('ForgotPasswordScreen (HU-1.1 paso 1)', () => {
  async function submit(email: string) {
    await render(<ForgotPasswordScreen />, { wrapper: Providers });
    await fireEvent.changeText(screen.getByLabelText(AUTH_LABELS.emailLabel), email);
    await fireEvent.press(screen.getByText(AUTH_LABELS.sendButton));
  }

  it('CA1/CA2: tras enviar va al paso 2 con el correo, exista o no la cuenta', async () => {
    jest.mocked(requestPasswordReset).mockResolvedValue(undefined);

    await submit('maria@orquidea.local');

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/reset-password',
        params: { email: 'maria@orquidea.local' },
      }),
    );
  });

  it('CA3: sin correo muestra "Debes ingresar tu correo electrónico."', async () => {
    await submit('');

    expect(await screen.findByText(AUTH_MESSAGES.emailRequired)).toBeTruthy();
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it('sin conexión muestra el mensaje de respaldo y no avanza', async () => {
    jest
      .mocked(requestPasswordReset)
      .mockRejectedValue(new ApiError({ status: 0, kind: 'network', path: '/x' }));

    await submit('maria@orquidea.local');

    expect(await screen.findByText(AUTH_MESSAGES.networkError)).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });
});

describe('ResetPasswordScreen (HU-1.1 paso 2)', () => {
  async function renderWithEmail(email?: string) {
    jest.mocked(useLocalSearchParams).mockReturnValue(email ? { email } : {});
    await render(<ResetPasswordScreen />, { wrapper: Providers });
  }

  async function fillAndSubmit(code: string, password: string, confirmPassword = password) {
    await fireEvent.changeText(screen.getByLabelText(AUTH_LABELS.codeLabel), code);
    await fireEvent.changeText(screen.getByLabelText(AUTH_LABELS.newPasswordLabel), password);
    await fireEvent.changeText(
      screen.getByLabelText(AUTH_LABELS.confirmNewPasswordLabel),
      confirmPassword,
    );
    await fireEvent.press(screen.getByText(AUTH_LABELS.resetButton));
  }

  it('CA1/CA2: muestra el mensaje de envío de la HU', async () => {
    await renderWithEmail('maria@orquidea.local');

    expect(screen.getByText(AUTH_MESSAGES.passwordResetRequested)).toBeTruthy();
  });

  it('con código y contraseñas válidos cambia la contraseña y vuelve al login', async () => {
    jest.mocked(resetPassword).mockResolvedValue(undefined);
    await renderWithEmail('maria@orquidea.local');

    await fillAndSubmit('482913', 'Nueva123');

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/login',
        params: { passwordReset: 'true' },
      }),
    );
    expect(resetPassword).toHaveBeenCalledWith({
      email: 'maria@orquidea.local',
      code: '482913',
      password: 'Nueva123',
    });
  });

  it('el campo de código solo admite números', async () => {
    await renderWithEmail('maria@orquidea.local');

    await fireEvent.changeText(screen.getByLabelText(AUTH_LABELS.codeLabel), '48a2-91');

    expect(screen.getByLabelText(AUTH_LABELS.codeLabel).props.value).toBe('48291');
  });

  it('con código incorrecto o vencido muestra el mensaje del servidor', async () => {
    jest.mocked(resetPassword).mockRejectedValue(
      new ApiError({
        status: 400,
        kind: 'http',
        path: '/api/autenticacion/restablecer-contrasena',
        serverMessage: 'Código incorrecto o vencido',
      }),
    );
    await renderWithEmail('maria@orquidea.local');

    await fillAndSubmit('111111', 'Nueva123');

    expect(await screen.findByText('Código incorrecto o vencido')).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('"Reenviar" vuelve a pedir el código para el mismo correo', async () => {
    jest.mocked(requestPasswordReset).mockResolvedValue(undefined);
    await renderWithEmail('maria@orquidea.local');

    await fireEvent.press(screen.getByText(AUTH_LABELS.resendCode));

    await waitFor(() =>
      expect(requestPasswordReset).toHaveBeenCalledWith({ email: 'maria@orquidea.local' }),
    );
  });

  it('sin correo en la ruta pide volver a solicitar el código', async () => {
    await renderWithEmail();

    expect(screen.getByText(AUTH_MESSAGES.missingResetEmail)).toBeTruthy();
    await fireEvent.press(screen.getByText(AUTH_LABELS.requestCodeAgain));
    expect(router.replace).toHaveBeenCalledWith('/forgot-password');
  });
});
