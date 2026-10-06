# src/features/admins/types/

**Responsabilidad:** tipos del dominio de administradores.

| Tipo | Descripción |
|---|---|
| `Admin` | `id`, `firstName`, `lastName`, `email`, `role` (`admin` \| `superadmin`), `isEnabled` |
| `CreateAdminInput`, `UpdateAdminInput` | Datos de entrada de los formularios |
| `RegisterRequestDto` | Forma del JSON de creación; los demás DTO se validan en `../schemas` |

La respuesta de revocación pasa a `USUARIO_REGISTRADO`; la app extrae su ID y la quita del listado.
