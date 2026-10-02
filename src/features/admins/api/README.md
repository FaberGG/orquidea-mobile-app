# src/features/admins/api/

**Responsabilidad:** llamadas a los endpoints de gestión de administradores mediante `@/lib/api`, con mapeo
DTO → `Admin`.

Archivo previsto: `admins.api.ts`

| Función | HU |
|---|---|
| `listAdmins()` | HU-5 |
| `getAdmin(id)` | HU-5 |
| `createAdmin({ firstName, lastName, email })` | HU-4 |
| `updateAdmin(id, changes)` | HU-5 |
| `revokeAdmin(id)` | HU-5 |

Los códigos de error de negocio (límite alcanzado, correo duplicado, único superadmin) deben acordarse con el
backend y documentarse en `docs/architecture/API.md`.
