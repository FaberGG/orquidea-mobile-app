import { type Role } from '@/permissions';

/** Nombre visible de cada rol con sesión (solo para mostrar; la UI decide con permisos). */
export const ROLE_LABELS: Record<Exclude<Role, 'visitor'>, string> = {
  user: 'Usuario registrado',
  admin: 'Administrador',
  superadmin: 'Superadministrador',
};
