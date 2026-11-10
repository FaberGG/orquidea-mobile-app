import { ROLE_PARENT, type Role } from './roles';

/** Capacidades de la app, con formato `recurso:acción`. Ver docs/architecture/ROLES-Y-PERMISOS.md §4. */
export type Permission =
  | 'auth:login'
  | 'auth:logout'
  | 'species:read'
  | 'species:create'
  | 'species:update'
  | 'species:delete'
  | 'species:download-qr'
  | 'admins:read'
  | 'admins:create'
  | 'admins:update'
  | 'announcements:publish'
  | 'announcements:manage'
  | 'content:manage'
  | 'sightings:create'
  | 'sightings:review'
  | 'stations:manage';

/**
 * Permisos que cada rol agrega a los que hereda.
 * `auth:login` es exclusivo del visitante, así que se excluye explícitamente de la herencia.
 * `sightings:create` sí se hereda: desde HU-18 v2.0 también crean reportes el administrador y el
 * superadministrador.
 */
const OWN_PERMISSIONS: Record<Role, readonly Permission[]> = {
  visitor: ['auth:login', 'species:read'],
  user: ['auth:logout', 'sightings:create'],
  admin: [
    'species:create',
    'species:update',
    'species:delete',
    'announcements:publish',
    'announcements:manage',
    'content:manage',
    'sightings:review',
    'species:download-qr',
    'stations:manage',
  ],
  superadmin: ['admins:read', 'admins:create', 'admins:update'],
};

/** Permisos que no se heredan: solo los tiene el rol que los declara. */
const NON_INHERITABLE: ReadonlySet<Permission> = new Set(['auth:login']);

function resolvePermissions(role: Role): Set<Permission> {
  const parent = ROLE_PARENT[role];
  const inherited = parent
    ? [...resolvePermissions(parent)].filter((permission) => !NON_INHERITABLE.has(permission))
    : [];
  return new Set([...inherited, ...OWN_PERMISSIONS[role]]);
}

/** Matriz completa `rol → permisos`, ya con la herencia aplicada. */
export const ROLE_PERMISSIONS: Readonly<Record<Role, ReadonlySet<Permission>>> = {
  visitor: resolvePermissions('visitor'),
  user: resolvePermissions('user'),
  admin: resolvePermissions('admin'),
  superadmin: resolvePermissions('superadmin'),
};
