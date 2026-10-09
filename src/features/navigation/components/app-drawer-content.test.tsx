import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { type DrawerContentComponentProps } from 'expo-router/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useSession, type Session } from '@/features/auth';
import { RoleProvider, type Role } from '@/permissions';

import { NAVIGATION_LABELS } from '../constants';
import { AppDrawerContent } from './app-drawer-content';

jest.mock('expo-router', () => ({ router: { navigate: jest.fn() } }));
jest.mock('@/features/auth', () => ({
  useSession: jest.fn(),
  ROLE_LABELS: {
    user: 'Usuario registrado',
    admin: 'Administrador',
    superadmin: 'Superadministrador',
  },
}));

/** Áreas seguras fijas: en pruebas no hay dispositivo que las reporte. */
const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const closeDrawer = jest.fn();

async function renderAs(role: Role) {
  const user =
    role === 'visitor'
      ? null
      : { id: '1', firstName: 'María', lastName: 'Solarte', email: 'maria@o.co', role };
  jest.mocked(useSession).mockReturnValue({ user, role } as Session);
  const props = { navigation: { closeDrawer } } as unknown as DrawerContentComponentProps;
  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <RoleProvider role={role}>
        <AppDrawerContent {...props} />
      </RoleProvider>
    </SafeAreaProvider>,
  );
}

describe('AppDrawerContent (menú lateral)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('al visitante le ofrece iniciar sesión y no muestra la administración', async () => {
    await renderAs('visitor');

    expect(screen.getByText(NAVIGATION_LABELS.guestName)).toBeTruthy();
    expect(screen.queryByText(NAVIGATION_LABELS.sectionAdmin)).toBeNull();

    await fireEvent.press(screen.getByText(NAVIGATION_LABELS.loginButton));
    expect(closeDrawer).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith('/login');
  });

  it('con sesión muestra nombre, iniciales y rol, y lleva a la cuenta', async () => {
    await renderAs('user');

    expect(screen.getByText('María Solarte')).toBeTruthy();
    expect(screen.getByText('MS')).toBeTruthy();
    expect(screen.getByText('Usuario registrado')).toBeTruthy();
    expect(screen.queryByText(NAVIGATION_LABELS.manageAccounts)).toBeNull();

    await fireEvent.press(screen.getByLabelText(NAVIGATION_LABELS.viewAccount));
    expect(router.navigate).toHaveBeenCalledWith('/account');
  });

  it('HU-16: el administrador ve "Publicar anuncio" y lleva al formulario', async () => {
    await renderAs('admin');

    await fireEvent.press(screen.getByText(NAVIGATION_LABELS.publishAnnouncement));
    expect(router.navigate).toHaveBeenCalledWith('/announcements/new');
  });

  it('HU-16: el usuario registrado no ve "Publicar anuncio"', async () => {
    await renderAs('user');
    expect(screen.queryByText(NAVIGATION_LABELS.publishAnnouncement)).toBeNull();
  });

  it('el administrador no ve la gestión de cuentas', async () => {
    await renderAs('admin');
    expect(screen.queryByText(NAVIGATION_LABELS.manageAccounts)).toBeNull();
  });

  it('el superadministrador ve la gestión de cuentas (admins:read)', async () => {
    await renderAs('superadmin');
    expect(screen.getByText(NAVIGATION_LABELS.sectionAdmin)).toBeTruthy();
    expect(screen.getByText(NAVIGATION_LABELS.manageAccounts)).toBeTruthy();
    await fireEvent.press(screen.getByText(NAVIGATION_LABELS.manageAccounts));
    expect(closeDrawer).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith('/admins');
  });

  it('los destinos sin implementar no son presionables', async () => {
    await renderAs('visitor');
    const item = screen.getByLabelText(
      `${NAVIGATION_LABELS.announcements}, ${NAVIGATION_LABELS.comingSoon}`,
    );
    expect(item.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
  });
  it('la gestión de contenido: Nueva ficha solo para administradores', async () => {
    await renderAs('user');
    expect(screen.queryByText(NAVIGATION_LABELS.newSpecies)).toBeNull();

    await renderAs('admin');
    await fireEvent.press(screen.getByText(NAVIGATION_LABELS.newSpecies));
    expect(closeDrawer).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith('/species/new');
  });
});
