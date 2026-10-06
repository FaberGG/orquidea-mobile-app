# src/features/admins/hooks/

**Responsabilidad:** queries y mutations de administradores, invalidación de caché y traducción de errores a
`ADMIN_MESSAGES`.

| Hook | Descripción |
|---|---|
| `useAdmins` | Listado desde `GET /api/administradores` |
| `useAdmin(id)` | Busca el detalle por ID a partir del listado de la API |
| `useCreateAdmin` | Crea; al éxito invalida el listado |
| `useUpdateAdmin` | Edita o inhabilita (`isEnabled`); muestra `Los cambios se guardaron correctamente.` |
| `useRevokeAdmin` | Revoca; si el revocado es el usuario actual, refresca la sesión |

Las mutaciones invalidan el listado. `useCreateAdmin` traduce el error de límite a un mensaje claro.
