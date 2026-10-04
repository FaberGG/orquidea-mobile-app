import { can } from './can';
import { type Permission } from './permissions';
import { useCurrentRole } from './role-context';

/** Indica si el usuario actual tiene el permiso indicado. */
export function usePermission(permission: Permission): boolean {
  return can(useCurrentRole(), permission);
}
