# src/features/admins/types/

**Responsabilidad:** tipos del dominio de administradores.

| Tipo | Descripción |
|---|---|
| `Admin` | `id`, `firstName`, `lastName`, `email`, `role` (`admin` \| `superadmin` \| `user` tras revocar), `isEnabled`, `createdAt` |
| `CreateAdminInput`, `UpdateAdminInput` | Datos de entrada de los formularios (inferidos de los esquemas) |
| `AdministratorDto`, `AdministratorUpdateRequestDto`, `RegisterResponseDto` | Forma del JSON de la API (campos en español); solo se usan en `../api` |
