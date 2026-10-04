import { type ReactNode } from 'react';

import { type Permission } from './permissions';
import { usePermission } from './use-permission';

type CanProps = {
  permission: Permission;
  children: ReactNode;
  /** Lo que se muestra sin el permiso. Por defecto nada (ocultar, no deshabilitar). */
  fallback?: ReactNode;
};

/** Renderiza `children` solo si el usuario actual tiene el permiso. */
export function Can({ permission, children, fallback = null }: CanProps) {
  return usePermission(permission) ? children : fallback;
}
