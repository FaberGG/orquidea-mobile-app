# src/features/auth/api/

**Responsabilidad:** comunicación con los endpoints de autenticación de la API, usando el cliente de `@/lib/api`.
Cada función recibe datos de dominio, construye la petición y devuelve modelos de dominio (no DTO).
Contrato: [`docs/api/`](../../../../docs/api/README.md).

Archivo previsto: `auth.api.ts`

| Función | Endpoint | HU |
|---|---|---|
| `login({ email, password })` | `POST /api/autenticacion/iniciar-sesion` → token, vigencia y usuario con rol | HU-1 |
| `getMe()` | `GET /api/autenticacion/yo` → restaura usuario y rol desde el token guardado | HU-1 |
| `requestPasswordReset({ email })` | `POST /api/autenticacion/recuperar-contrasena` → envía un código de 6 dígitos | HU-1.1 |
| `resetPassword({ email, code, password })` | `POST /api/autenticacion/restablecer-contrasena` | HU-1.1 |
| `register({ firstName, lastName, email, password })` | `POST /api/autenticacion/registro` | HU-2 |

No hay funciones de renovación de token ni de cierre de sesión: la API no tiene esos endpoints. Cerrar sesión
(HU-3) es borrar el token localmente (`useLogout`).

## Traducción de campos

| API | App |
|---|---|
| `correo`, `contrasena`, `nombre`, `apellido`, `codigo` | `email`, `password`, `firstName`, `lastName`, `code` |
| `rol: USUARIO_REGISTRADO \| ADMINISTRADOR \| SUPERADMINISTRADOR` | `Role`: `user \| admin \| superadmin` |
| `token`, `expiraEnSegundos` | `token`, `expiresAt` (fecha calculada al recibir la respuesta) |

Reglas: sin estado, sin React y sin textos de UI. Los errores se propagan como `ApiError`.
