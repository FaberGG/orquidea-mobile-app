# src/features/auth/types/

**Responsabilidad:** tipos del dominio de acceso.

| Tipo | Descripción |
|---|---|
| `User` | `id`, `firstName`, `lastName`, `email`, `role` |
| `AuthToken` | `token` (JWT) y `expiresAt`; la API no entrega token de renovación |
| `SessionStatus` | `'loading' \| 'authenticated' \| 'guest'` |
| `AuthenticatedUserDto`, `LoginResponseDto`, `RegisterRequestDto`… | Forma exacta del JSON de la API (campos en español); solo se usan en `../api` |

El tipo `Role` no se define aquí: vive en `@/permissions`.
