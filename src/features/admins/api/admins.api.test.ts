import { apiClient } from '@/lib/api';

import { createAdmin, getAdmin, listAdmins, revokeAdmin, updateAdmin } from './admins.api';

jest.mock('@/lib/api', () => ({
  ApiError: jest.requireActual('@/lib/api/api-error').ApiError,
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const response = {
  id: '368b47f8-8798-4be9-94f1-a8168d90e0ea',
  nombre: 'María',
  apellido: 'Pérez',
  correo: 'maria@orquidea.co',
  rol: 'ADMINISTRADOR',
};

describe('createAdmin: contrato HU-4', () => {
  it('envía solo los cuatro datos aceptados y mapea la respuesta', async () => {
    jest.mocked(apiClient.post).mockResolvedValue(response);
    const result = await createAdmin({
      firstName: ' María ',
      lastName: ' Pérez ',
      email: ' maria@orquidea.co ',
      password: 'Clave123',
    });
    expect(apiClient.post).toHaveBeenCalledWith('/api/administradores/registrarAdmin', {
      body: {
        nombre: 'María',
        apellido: 'Pérez',
        correo: 'maria@orquidea.co',
        contrasena: 'Clave123',
      },
    });
    expect(result).toEqual({
      id: response.id,
      firstName: 'María',
      lastName: 'Pérez',
      email: 'maria@orquidea.co',
      role: 'admin',
    });
  });

  it('rechaza una respuesta cuyo rol contradice el contrato', async () => {
    jest.mocked(apiClient.post).mockResolvedValue({ ...response, rol: 'SUPERADMINISTRADOR' });
    await expect(
      createAdmin({
        firstName: 'María',
        lastName: 'Pérez',
        email: 'maria@orquidea.co',
        password: 'Clave123',
      }),
    ).rejects.toThrow();
  });
});

describe('gestión de administradores: contrato HU-5', () => {
  const account = { ...response, habilitado: true };

  beforeEach(() => jest.clearAllMocks());

  it('lista cuentas reales y encuentra un detalle sin GET individual', async () => {
    jest.mocked(apiClient.get).mockResolvedValue([account]);
    expect(await listAdmins()).toEqual([
      {
        id: account.id,
        firstName: 'María',
        lastName: 'Pérez',
        email: account.correo,
        role: 'admin',
        isEnabled: true,
      },
    ]);
    expect((await getAdmin(account.id)).id).toBe(account.id);
    expect(apiClient.get).toHaveBeenCalledWith('/api/administradores');
  });

  it('envía el estado de inhabilitación y solo los campos que acepta PUT', async () => {
    jest.mocked(apiClient.put).mockResolvedValue({ ...account, habilitado: false });
    const result = await updateAdmin(account.id, {
      firstName: ' María ',
      lastName: ' Pérez ',
      email: ' maria@orquidea.co ',
      isEnabled: false,
    });
    expect(apiClient.put).toHaveBeenCalledWith(`/api/administradores/${account.id}`, {
      body: { nombre: 'María', apellido: 'Pérez', correo: 'maria@orquidea.co', habilitado: false },
    });
    expect(result.isEnabled).toBe(false);
  });

  it('acepta la respuesta de revocación con rol de usuario registrado', async () => {
    jest.mocked(apiClient.post).mockResolvedValue({ ...account, rol: 'USUARIO_REGISTRADO' });
    expect(await revokeAdmin(account.id)).toBe(account.id);
    expect(apiClient.post).toHaveBeenCalledWith(
      `/api/administradores/${account.id}/revocar-acceso`,
    );
  });
});
