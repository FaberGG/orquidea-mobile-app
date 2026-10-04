import { toLoginResult, toUser } from './auth.mappers';

const userDto = {
  id: '3f6c1a52-7a1e-4c5b-9c1d-2b8f0e4a9d10',
  nombre: 'María',
  apellido: 'Pérez',
  correo: 'admin@orquidea.local',
  rol: 'ADMINISTRADOR',
};

describe('auth.mappers', () => {
  it.each([
    ['USUARIO_REGISTRADO', 'user'],
    ['ADMINISTRADOR', 'admin'],
    ['SUPERADMINISTRADOR', 'superadmin'],
  ])('traduce el rol %s a %s', (rol, role) => {
    expect(toUser({ ...userDto, rol }).role).toBe(role);
  });

  it('traduce los campos del usuario al modelo de la app', () => {
    expect(toUser(userDto)).toEqual({
      id: userDto.id,
      firstName: 'María',
      lastName: 'Pérez',
      email: 'admin@orquidea.local',
      role: 'admin',
    });
  });

  it('rechaza un rol desconocido', () => {
    expect(() => toUser({ ...userDto, rol: 'INVITADO' })).toThrow();
  });

  it('calcula el vencimiento del token a partir de expiraEnSegundos', () => {
    const result = toLoginResult(
      { token: 'jwt', tipo: 'Bearer', expiraEnSegundos: 28800, usuario: userDto },
      1_000,
    );
    expect(result.token).toEqual({ token: 'jwt', expiresAt: 1_000 + 28_800_000 });
    expect(result.user.role).toBe('admin');
  });

  it('rechaza una respuesta de login sin token', () => {
    expect(() => toLoginResult({ expiraEnSegundos: 10, usuario: userDto })).toThrow();
  });
});
