# src/features/admins/hooks/

**Responsabilidad:** queries y mutations de administradores, invalidación de caché y traducción de errores a
`ADMIN_MESSAGES`.

| Hook | Descripción |
|---|---|
| `useAdmins` | Listado (query) |
| `useAdmin(id)` | Detalle (query) |
| `useCreateAdmin` | Crea; al éxito invalida el listado |
| `useUpdateAdmin` | Edita; muestra `Los cambios se guardaron correctamente.` |
| `useRevokeAdmin` | Revoca; si el revocado es el usuario actual, refresca la sesión |
