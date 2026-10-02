# src/permissions/ — Roles y permisos

**Responsabilidad:** única fuente de verdad (en el cliente) de **qué puede hacer cada rol**. Permite que todas
las pantallas sean compartidas y que cada elemento se muestre u oculte según el permiso del usuario actual.

Modelo completo y matriz: [`docs/architecture/ROLES-Y-PERMISOS.md`](../../docs/architecture/ROLES-Y-PERMISOS.md).

## Contenido previsto

| Archivo | Contenido |
|---|---|
| `roles.ts` | `type Role = 'visitor' \| 'user' \| 'admin' \| 'superadmin'` y su jerarquía |
| `permissions.ts` | `type Permission` (p. ej. `'species:update'`) y la matriz `ROLE_PERMISSIONS` |
| `can.ts` | `can(role, permission): boolean`: función pura |
| `use-permission.ts` | `usePermission(permission)`: usa el rol de la sesión actual |
| `can.tsx` (componente) | `<Can permission="..." fallback={...}>` |
| `__tests__/` | Pruebas de la matriz para cada rol (obligatorias) |
| `index.ts` | API pública |

## Uso

```tsx
<Can permission="species:delete">
  <DeleteSpeciesButton id={species.id} />
</Can>

const canCreate = usePermission('species:create');
```

## Reglas

- La UI pregunta por **permisos**, nunca compara `role === '...'`.
- `superadmin` hereda todo lo de `admin` (HU-6); `admin` hereda de `user`; `user` de `visitor`.
- Agregar un permiso implica actualizar la matriz, sus pruebas y el documento de roles en el mismo PR.
- Esto es experiencia de usuario, no seguridad: la API valida siempre.
