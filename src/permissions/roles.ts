/** Roles de la app. `visitor` es el rol implícito sin sesión. */
export const ROLES = ['visitor', 'user', 'admin', 'superadmin'] as const;

export type Role = (typeof ROLES)[number];

/** Rol del que hereda cada rol (jerarquía: superadmin ⊇ admin ⊇ user ⊇ visitor). */
export const ROLE_PARENT: Record<Role, Role | null> = {
  visitor: null,
  user: 'visitor',
  admin: 'user',
  superadmin: 'admin',
};
