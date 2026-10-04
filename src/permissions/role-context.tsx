import { createContext, use, type ReactNode } from 'react';

import { type Role } from './roles';

const RoleContext = createContext<Role>('visitor');

type RoleProviderProps = {
  role: Role;
  children: ReactNode;
};

/**
 * Expone el rol actual a los permisos. Lo monta `@/providers` con el rol de la sesión, para que
 * `permissions/` no dependa de los internos de `features/auth`.
 */
export function RoleProvider({ role, children }: RoleProviderProps) {
  return <RoleContext value={role}>{children}</RoleContext>;
}

/** Rol del usuario actual (`visitor` si no hay sesión). */
export function useCurrentRole(): Role {
  return use(RoleContext);
}
