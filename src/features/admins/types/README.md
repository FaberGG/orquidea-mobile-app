# src/features/admins/types/

**Responsabilidad:** tipos del dominio de administradores.

| Tipo | Descripción |
|---|---|
| `Admin` | `id`, `firstName`, `lastName`, `email`, `role` (`admin` \| `superadmin`), `isActive` |
| `CreateAdminInput`, `UpdateAdminInput` | Datos de entrada de los formularios (inferidos del esquema) |
| `AdminDto` | Forma del JSON de la API; solo se usa en `../api` |
