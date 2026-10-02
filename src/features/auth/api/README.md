# src/features/auth/api/

**Responsabilidad:** comunicación con los endpoints de autenticación de la API, usando el cliente de `@/lib/api`.
Cada función recibe datos de dominio, construye la petición y devuelve modelos de dominio (no DTO).

Archivo previsto: `auth.api.ts`

| Función | Uso | HU |
|---|---|---|
| `login({ email, password })` | Obtiene tokens y usuario con rol | HU-1 |
| `requestPasswordReset({ email })` | Solicita el correo de restablecimiento | HU-1.1 |
| `register({ firstName, lastName, email, password })` | Crea una cuenta de usuario registrado | HU-2 |
| `getMe()` | Restaura el usuario y el rol desde el token guardado | HU-1 |
| `refreshToken()` | Renueva el token de acceso (usado por `lib/api`) | — |
| `logout()` | Invalida el token en el servidor, si la API lo soporta | HU-3 |

Reglas: sin estado, sin React y sin mensajes de UI. Los errores se propagan como `ApiError`; la traducción a
mensajes la hacen los hooks.
