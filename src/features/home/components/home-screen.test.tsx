import { render, screen } from '@testing-library/react-native';

import { useSession, type Session } from '@/features/auth';
import { RoleProvider, type Role } from '@/permissions';

import { HomeScreen } from './home-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));

function mockSession(role: Role) {
  const user =
    role === 'visitor'
      ? null
      : { id: '1', firstName: 'María', lastName: 'Pérez', email: 'm@o.co', role };
  jest.mocked(useSession).mockReturnValue({ user, role } as Session);
}

async function renderAs(role: Role) {
  mockSession(role);
  await render(
    <RoleProvider role={role}>
      <HomeScreen />
    </RoleProvider>,
  );
}

describe('HomeScreen (HU-1 CA1: opciones según el rol)', () => {
  it('al visitante le ofrece iniciar sesión y solo consultar fichas', async () => {
    await renderAs('visitor');
    expect(screen.getByText('INICIAR SESIÓN')).toBeTruthy();
    expect(screen.getByText('Fichas taxonómicas')).toBeTruthy();
    expect(screen.queryByText('Gestionar fichas taxonómicas')).toBeNull();
  });

  it('al usuario registrado lo saluda y no le muestra opciones de administración', async () => {
    await renderAs('user');
    expect(screen.getByText('Hola, María')).toBeTruthy();
    expect(screen.getByText('Rol: Usuario registrado')).toBeTruthy();
    expect(screen.queryByText('INICIAR SESIÓN')).toBeNull();
    expect(screen.queryByText('Gestionar fichas taxonómicas')).toBeNull();
  });

  it('al administrador le muestra la gestión de fichas pero no la de administradores', async () => {
    await renderAs('admin');
    expect(screen.getByText('Gestionar fichas taxonómicas')).toBeTruthy();
    expect(screen.queryByText('Gestionar administradores')).toBeNull();
  });

  it('al superadministrador le muestra todo lo del administrador y la gestión de administradores', async () => {
    await renderAs('superadmin');
    expect(screen.getByText('Gestionar fichas taxonómicas')).toBeTruthy();
    expect(screen.getByText('Gestionar administradores')).toBeTruthy();
  });
});
