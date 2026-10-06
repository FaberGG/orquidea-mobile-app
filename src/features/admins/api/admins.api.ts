import { apiClient } from '@/lib/api';

import { registerResponseSchema } from '../schemas';
import { type CreateAdminInput, type CreatedAdmin, type RegisterRequestDto } from '../types';

/** HU-4: crea una cuenta ADMINISTRADOR. El rol y la habilitación los determina el backend. */
export async function createAdmin(input: CreateAdminInput): Promise<CreatedAdmin> {
  const body: RegisterRequestDto = {
    nombre: input.firstName.trim(),
    apellido: input.lastName.trim(),
    correo: input.email.trim(),
    contrasena: input.password,
  };
  const response = await apiClient.post<unknown>('/api/administradores/registrarAdmin', { body });
  const parsed = registerResponseSchema.parse(response);
  return {
    id: parsed.id,
    firstName: parsed.nombre,
    lastName: parsed.apellido,
    email: parsed.correo,
    role: 'admin',
  };
}
