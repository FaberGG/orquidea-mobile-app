import { z } from 'zod';

import { type Admin } from '../types';

const adminDtoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  apellido: z.string(),
  correo: z.string(),
  rol: z.enum(['ADMINISTRADOR', 'SUPERADMINISTRADOR']),
  habilitado: z.boolean(),
});

export function toAdmin(value: unknown): Admin {
  const parsed = adminDtoSchema.parse(value);
  return {
    id: parsed.id,
    firstName: parsed.nombre,
    lastName: parsed.apellido,
    email: parsed.correo,
    role: parsed.rol === 'SUPERADMINISTRADOR' ? 'superadmin' : 'admin',
    isEnabled: parsed.habilitado,
  };
}

export function toAdminList(value: unknown): Admin[] {
  return z.array(adminDtoSchema).parse(value).map(toAdmin);
}

export function toRevokedAdminId(value: unknown): string {
  return adminDtoSchema.extend({ rol: z.literal('USUARIO_REGISTRADO') }).parse(value).id;
}
