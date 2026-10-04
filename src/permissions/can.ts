import { ROLE_PERMISSIONS, type Permission } from './permissions';
import { type Role } from './roles';

/** Indica si un rol tiene un permiso. Función pura: base de `usePermission` y `<Can>`. */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}
