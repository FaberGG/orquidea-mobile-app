# src/features/admins/ — Gestión de administradores (HE-02)

**Responsabilidad:** permitir al superadministrador crear, editar y revocar cuentas de administrador.

**Acceso:** solo superadministrador (permisos `admins:*`). HU-6 (herencia de permisos de admin) se resuelve en
`@/permissions`, no aquí.

## Historias

| HU | Descripción | Pantalla |
|---|---|---|
| HU-4 | Crear administrador | `CreateAdminScreen` ✅ |
| HU-5 | Editar, inhabilitar o revocar administrador | `AdminListScreen` parcial; `EditAdminScreen` pendiente |

⛔ **Bloqueado en parte:** la API no tiene endpoints para listar ni consultar administradores
([docs/api B2](../../../docs/api/README.md#5-brechas-con-las-historias-de-usuario)). Editar y revocar existen, pero no
hay de dónde obtener el listado ni los datos actuales del administrador.

El menú lateral ya abre `/admins` dentro del layout compartido. La pantalla explica el bloqueo del listado y
permite crear administrador. No se muestran cuentas ficticias ni se habilita edición/revocación sin datos reales.
`POST /api/administradores/registrarAdmin` crea solo `ADMINISTRADOR`, según el backend actual.

## Contenido previsto

| Carpeta | Contenido |
|---|---|
| [`api/`](api/README.md) | `admins.api.ts`: `createAdmin`, `updateAdmin`, `revokeAdmin` (+ `listAdmins`, `getAdmin` cuando existan) |
| [`components/`](components/README.md) | Pantallas, `AdminForm`, `AdminListItem`, diálogo de confirmación de revocación |
| [`hooks/`](hooks/README.md) | `useAdmins`, `useAdmin`, `useCreateAdmin`, `useUpdateAdmin`, `useRevokeAdmin` |
| [`schemas/`](schemas/README.md) | `admin.schema.ts` |
| [`types/`](types/README.md) | `Admin`, DTO |
| `constants.ts` | `ADMIN_MESSAGES`, claves de caché `adminKeys` |
| `index.ts` | Exporta las pantallas |

## Reglas de negocio (las decide la API)

- Límite configurable de administradores (actualmente 3). La app **no** cuenta administradores para bloquear;
  muestra el `mensaje` cuando la API rechaza. El contrato aún no documenta este error ([docs/api B3](../../../docs/api/README.md#5-brechas-con-las-historias-de-usuario)).
- No se puede revocar al único superadministrador.
- Revocar degrada la cuenta a usuario registrado; la notificación por correo la envía el backend.
- **Inhabilitar ≠ revocar:** `habilitado: false` (en `PUT`) impide iniciar sesión sin cambiar el rol; revocar cambia el rol.

## Mensajes (textuales)

Se guardan en `constants.ts` para las validaciones del cliente y como respaldo; los errores de la API se
muestran con su `mensaje`, que coincide con estos textos (ver [CODIGO §10](../../../docs/conventions/CODIGO.md#10-errores)).

| Caso | Mensaje |
|---|---|
| HU-4 límite alcanzado | `Has alcanzado el número de administradores configurado. Contacta al equipo de desarrollo si necesitas ampliarlo.` |
| HU-4 correo registrado | `Este correo ya está registrado.` |
| HU-5 edición exitosa | `Los cambios se guardaron correctamente.` |
| HU-5 autorrevocación del único superadmin | `No puedes revocar el único superadministrador de la plataforma.` |
