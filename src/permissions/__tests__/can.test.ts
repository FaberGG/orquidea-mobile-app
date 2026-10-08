import { can } from '../can';
import { type Permission } from '../permissions';
import { ROLES, type Role } from '../roles';

// Matriz esperada, copiada de docs/architecture/ROLES-Y-PERMISOS.md §4.
const EXPECTED: Record<Permission, readonly Role[]> = {
  'auth:login': ['visitor'],
  'auth:logout': ['user', 'admin', 'superadmin'],
  'species:read': ['visitor', 'user', 'admin', 'superadmin'],
  'species:create': ['admin', 'superadmin'],
  'species:update': ['admin', 'superadmin'],
  'species:delete': ['admin', 'superadmin'],
  'admins:read': ['superadmin'],
  'admins:create': ['superadmin'],
  'admins:update': ['superadmin'],
  'announcements:publish': ['admin', 'superadmin'],
};

describe('can', () => {
  const cases = (Object.keys(EXPECTED) as Permission[]).flatMap((permission) =>
    ROLES.map((role) => [role, permission, EXPECTED[permission].includes(role)] as const),
  );

  it.each(cases)('%s → %s: %s', (role, permission, expected) => {
    expect(can(role, permission)).toBe(expected);
  });

  it('el superadministrador tiene todos los permisos del administrador (HU-6)', () => {
    const adminPermissions = (Object.keys(EXPECTED) as Permission[]).filter((permission) =>
      can('admin', permission),
    );
    expect(adminPermissions.every((permission) => can('superadmin', permission))).toBe(true);
  });
});
