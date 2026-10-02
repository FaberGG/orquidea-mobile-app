# src/app/(admin)/admins/ — Gestión de administradores

**Acceso:** solo superadministrador (`admins:read`, `admins:create`, `admins:update`).
Protegido con un `Stack.Protected` anidado en `(admin)/_layout.tsx`.

| Archivo | URL | Pantalla (`@/features/admins`) | HU |
|---|---|---|---|
| `index.tsx` | `/admins` | `AdminListScreen`: listado de administradores | HU-5 |
| `new.tsx` | `/admins/new` | `CreateAdminScreen` | HU-4 |
| `[id].tsx` | `/admins/:id` | `EditAdminScreen`: **GUARDAR CAMBIOS** y **REVOCAR ACCESO** | HU-5 |

El punto de entrada para el superadmin es la pantalla de cuenta (`(tabs)/account.tsx`).
