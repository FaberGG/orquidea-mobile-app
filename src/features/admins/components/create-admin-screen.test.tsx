import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { type ReactNode } from 'react';

import { ApiError } from '@/lib/api';

import { createAdmin } from '../api';
import { ADMIN_MESSAGES } from '../constants';
import { CreateAdminScreen } from './create-admin-screen';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), replace: jest.fn() } }));
jest.mock('../api', () => ({ createAdmin: jest.fn() }));

const mockedCreateAdmin = jest.mocked(createAdmin);
let client: QueryClient;

function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

async function fillValidForm() {
  await fireEvent.changeText(screen.getByLabelText('Nombre'), 'María');
  await fireEvent.changeText(screen.getByLabelText('Apellido'), 'Pérez');
  await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'maria@orquidea.co');
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'Clave123');
  await fireEvent.changeText(screen.getByLabelText('Confirmar contraseña'), 'Clave123');
}

describe('CreateAdminScreen (HU-4)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { gcTime: Infinity },
      },
    });
  });

  afterEach(() => client.clear());

  it('crea Administrador y confirma datos devueltos por la API', async () => {
    mockedCreateAdmin.mockResolvedValue({
      id: '368b47f8-8798-4be9-94f1-a8168d90e0ea',
      firstName: 'María',
      lastName: 'Pérez',
      email: 'maria@orquidea.co',
      role: 'admin',
    });
    await render(<CreateAdminScreen />, { wrapper: Providers });
    await fillValidForm();
    await fireEvent.press(screen.getByText('CREAR ADMINISTRADOR'));

    await waitFor(() =>
      expect(mockedCreateAdmin.mock.calls[0][0]).toEqual({
        firstName: 'María',
        lastName: 'Pérez',
        email: 'maria@orquidea.co',
        password: 'Clave123',
      }),
    );
    expect(await screen.findByText(ADMIN_MESSAGES.created)).toBeTruthy();
    expect(screen.getByText('maria@orquidea.co')).toBeTruthy();
    await fireEvent.press(screen.getByText('VOLVER A ADMINISTRADORES'));
    expect(router.replace).toHaveBeenCalledWith('/admins');
  });

  it('no envía la contraseña si la confirmación no coincide', async () => {
    await render(<CreateAdminScreen />, { wrapper: Providers });
    await fillValidForm();
    await fireEvent.changeText(screen.getByLabelText('Confirmar contraseña'), 'Diferente');
    await fireEvent.press(screen.getByText('CREAR ADMINISTRADOR'));
    expect(await screen.findByText(ADMIN_MESSAGES.passwordMismatch)).toBeTruthy();
    expect(mockedCreateAdmin).not.toHaveBeenCalled();
  });

  it('muestra el límite comunicado por el backend', async () => {
    mockedCreateAdmin.mockRejectedValue(
      new ApiError({
        status: 409,
        kind: 'http',
        path: '/api/administradores/registrarAdmin',
        serverMessage: ADMIN_MESSAGES.limitReached,
      }),
    );
    await render(<CreateAdminScreen />, { wrapper: Providers });
    await fillValidForm();
    await fireEvent.press(screen.getByText('CREAR ADMINISTRADOR'));
    expect(await screen.findByText(ADMIN_MESSAGES.limitReached)).toBeTruthy();
  });
});
