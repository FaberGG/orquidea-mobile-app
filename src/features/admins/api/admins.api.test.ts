import { apiClient } from '@/lib/api';

import { createAdmin } from './admins.api';

jest.mock('@/lib/api', () => ({ apiClient: { post: jest.fn() } }));

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
