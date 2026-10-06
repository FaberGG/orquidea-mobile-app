# src/features/admins/hooks/

**Responsabilidad:** queries y mutations de administradores, invalidación de caché y traducción de errores a
`ADMIN_MESSAGES`.

| Hook | Descripción |
|---|---|
| `useAdmins` | Listado (query) — ⛔ pendiente de endpoint (docs/api B2) |
| `useAdmin(id)` | Detalle (query) — ⛔ pendiente de endpoint (docs/api B2) |
| `useCreateAdmin` | Crea; al éxito invalida el listado |
| `useUpdateAdmin` | Edita o inhabilita (`isEnabled`); muestra `Los cambios se guardaron correctamente.` |
| `useRevokeAdmin` | Revoca; si el revocado es el usuario actual, refresca la sesión |

`useCreateAdmin` ya está implementado; traduce el error de límite actual del backend a un mensaje claro.
