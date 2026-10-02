# src/features/admins/ — Gestión de administradores (HE-02)

**Responsabilidad:** permitir al superadministrador crear, editar y revocar cuentas de administrador.

**Acceso:** solo superadministrador (permisos `admins:*`). HU-6 (herencia de permisos de admin) se resuelve en
`@/permissions`, no aquí.

## Historias

| HU | Descripción | Pantalla |
|---|---|---|
| HU-4 | Crear administrador | `CreateAdminScreen` |
| HU-5 | Editar o revocar administrador | `AdminListScreen`, `EditAdminScreen` |

## Contenido previsto

| Carpeta | Contenido |
|---|---|
| [`api/`](api/README.md) | `admins.api.ts`: `listAdmins`, `getAdmin`, `createAdmin`, `updateAdmin`, `revokeAdmin` |
| [`components/`](components/README.md) | Pantallas, `AdminForm`, `AdminListItem`, diálogo de confirmación de revocación |
| [`hooks/`](hooks/README.md) | `useAdmins`, `useAdmin`, `useCreateAdmin`, `useUpdateAdmin`, `useRevokeAdmin` |
| [`schemas/`](schemas/README.md) | `admin.schema.ts` |
| [`types/`](types/README.md) | `Admin`, DTO |
| `constants.ts` | `ADMIN_MESSAGES`, claves de caché `adminKeys` |
| `index.ts` | Exporta las pantallas |

## Reglas de negocio (las decide la API)

- Límite configurable de administradores (actualmente 3). La app **no** cuenta administradores para bloquear;
  muestra el mensaje cuando la API rechaza.
- No se puede revocar al único superadministrador.
- Revocar degrada la cuenta a usuario registrado; la notificación por correo la envía el backend.

## Mensajes (textuales)

| Caso | Mensaje |
|---|---|
| HU-4 límite alcanzado | `Has alcanzado el número de administradores configurado. Contacta al equipo de desarrollo si necesitas ampliarlo.` |
| HU-4 correo registrado | `Este correo ya está registrado.` |
| HU-5 edición exitosa | `Los cambios se guardaron correctamente.` |
| HU-5 autorrevocación del único superadmin | `No puedes revocar el único superadministrador de la plataforma.` |
