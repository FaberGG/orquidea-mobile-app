import { ApiError, apiClient } from '@/lib/api';

import { registerResponseSchema, toAdmin, toAdminList, toRevokedAdminId } from '../schemas';
import {
  type Admin,
  type CreateAdminInput,
  type CreatedAdmin,
  type RegisterRequestDto,
  type UpdateAdminInput,
} from '../types';

const ADMIN_PATH = '/api/administradores';

export async function listAdmins(): Promise<Admin[]> {
  return toAdminList(await apiClient.get<unknown>(ADMIN_PATH));
}

export async function getAdmin(id: string): Promise<Admin> {
  // El backend publica el listado, pero todavía no un GET por ID.
  const admin = (await listAdmins()).find((item) => item.id === id);
  if (!admin) throw new ApiError({ status: 404, kind: 'http', path: ADMIN_PATH });
  return admin;
}

export async function updateAdmin(id: string, input: UpdateAdminInput): Promise<Admin> {
  const body = {
    nombre: input.firstName.trim(),
    apellido: input.lastName.trim(),
    correo: input.email.trim(),
    habilitado: input.isEnabled,
  };
  return toAdmin(await apiClient.put<unknown>(`${ADMIN_PATH}/${encodeURIComponent(id)}`, { body }));
}

export async function revokeAdmin(id: string): Promise<string> {
  return toRevokedAdminId(
    await apiClient.post<unknown>(`${ADMIN_PATH}/${encodeURIComponent(id)}/revocar-acceso`),
  );
}

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
