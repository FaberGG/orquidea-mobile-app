# src/features/admins/api/

**Responsabilidad:** llamadas a los endpoints de gestión de administradores mediante `@/lib/api`, con traducción
DTO → `Admin`. Contrato: [`docs/api/`](../../../../docs/api/README.md).

Archivo previsto: `admins.api.ts`

| Función | Endpoint | HU |
|---|---|---|
| `createAdmin({ firstName, lastName, email, password })` | `POST /api/administradores/registrarAdmin` (cuerpo `RegisterRequest`) | HU-4 |
| `updateAdmin(id, { firstName, lastName, email, isEnabled })` | `PUT /api/administradores/{id}` | HU-5 |
| `revokeAdmin(id)` | `POST /api/administradores/{id}/revocar-acceso` | HU-5 |
| `listAdmins()` | ⛔ No existe en la API (brecha B2) | HU-5 |
| `getAdmin(id)` | ⛔ No existe en la API (brecha B2) | HU-5 |

`createAdmin` ya envía el `RegisterRequest` real y valida `RegisterResponse`. No hay llamadas de listado
hasta que el backend publique el contrato correspondiente.

## Errores

| Estado | Caso |
|---|---|
| 400 | Campos obligatorios o correo inválido |
| 403 | El usuario no es superadministrador |
| 404 | El administrador no existe |
| 409 | Correo ya registrado (crear/editar) · único superadministrador (revocar) |

El contrato declara estos errores con `ApiResponse` (esquema vacío) en lugar de `ApiErrorResponse`
(brecha B4). Mientras se confirma, `lib/api` debe tolerar un cuerpo sin `mensaje` y usar el respaldo local.
