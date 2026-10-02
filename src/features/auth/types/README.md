# src/features/auth/types/

**Responsabilidad:** tipos del dominio de acceso.

| Tipo | Descripción |
|---|---|
| `User` | `id`, `firstName`, `lastName`, `email`, `role` |
| `AuthTokens` | `accessToken`, `refreshToken` (según contrato de la API) |
| `SessionStatus` | `'loading' \| 'authenticated' \| 'guest'` |
| `UserDto`, `LoginResponseDto` | Forma exacta del JSON de la API; solo se usan en `../api` |

El tipo `Role` no se define aquí: vive en `@/permissions`.
