import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { type ReactNode } from 'react';

import { ApiError } from '@/lib/api';

import { register } from '../api';
import { AUTH_LABELS, AUTH_MESSAGES } from '../constants';
import { RegisterScreen } from './register-screen';

jest.mock('expo-router', () => ({ router: { replace: jest.fn(), push: jest.fn() } }));
jest.mock('../api', () => ({ register: jest.fn() }));

const mockedRegister = jest.mocked(register);
let queryClient: QueryClient;

function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

type FormInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
};

const VALID: Required<FormInput> = {
  firstName: 'María',
  lastName: 'Solarte',
  email: 'maria@orquidea.local',
  password: 'Clave123',
  confirmPassword: 'Clave123',
  acceptTerms: true,
};

async function fillAndSubmit(input: FormInput) {
  const values = { ...VALID, ...input };
  await fireEvent.changeText(screen.getByLabelText(AUTH_LABELS.firstNameLabel), values.firstName);
  await fireEvent.changeText(screen.getByLabelText(AUTH_LABELS.lastNameLabel), values.lastName);
  await fireEvent.changeText(screen.getByLabelText(AUTH_LABELS.emailLabel), values.email);
  await fireEvent.changeText(screen.getByLabelText(AUTH_LABELS.passwordLabel), values.password);
  await fireEvent.changeText(
    screen.getByLabelText(AUTH_LABELS.confirmPasswordLabel),
    values.confirmPassword,
  );
  if (values.acceptTerms) await fireEvent.press(screen.getByRole('checkbox'));
  await fireEvent.press(screen.getByText(AUTH_LABELS.registerButton));
}

describe('RegisterScreen (HU-2)', () => {
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

  it('CA1: con datos válidos crea la cuenta y vuelve al login', async () => {
    mockedRegister.mockResolvedValue(undefined);
    await render(<RegisterScreen />, { wrapper: Providers });

    await fillAndSubmit({});

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/login',
        params: { registered: 'true' },
      }),
    );
    expect(mockedRegister).toHaveBeenCalledWith({
      firstName: 'María',
      lastName: 'Solarte',
      email: 'maria@orquidea.local',
      password: 'Clave123',
    });
  });

  it('CA2: con un correo ya registrado muestra "Este correo ya está registrado."', async () => {
    mockedRegister.mockRejectedValue(
      new ApiError({ status: 409, kind: 'http', path: '/api/autenticacion/registro' }),
    );
    await render(<RegisterScreen />, { wrapper: Providers });

    await fillAndSubmit({});

    expect(await screen.findByText(AUTH_MESSAGES.emailAlreadyRegistered)).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('CA3: con campos vacíos muestra "Todos los campos son obligatorios." sin llamar a la API', async () => {
    await render(<RegisterScreen />, { wrapper: Providers });

    await fillAndSubmit({ lastName: '' });

    expect(await screen.findByText(AUTH_MESSAGES.registerRequiredFields)).toBeTruthy();
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it('CA4: con un correo inválido muestra "Ingresa un correo electrónico válido."', async () => {
    await render(<RegisterScreen />, { wrapper: Providers });

    await fillAndSubmit({ email: 'maria@' });

    expect(await screen.findByText(AUTH_MESSAGES.invalidEmail)).toBeTruthy();
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it('pide aceptar los términos antes de registrar', async () => {
    await render(<RegisterScreen />, { wrapper: Providers });

    await fillAndSubmit({ acceptTerms: false });

    expect(await screen.findByText(AUTH_MESSAGES.termsNotAccepted)).toBeTruthy();
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it('"Iniciar sesión" vuelve al login', async () => {
    await render(<RegisterScreen />, { wrapper: Providers });

    await fireEvent.press(screen.getByText(AUTH_LABELS.loginLink));

    expect(router.replace).toHaveBeenCalledWith('/login');
  });
});
