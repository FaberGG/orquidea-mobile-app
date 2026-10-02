# src/features/auth/ — Acceso y sesión (HE-01)

**Responsabilidad:** identificar al usuario, mantener su sesión y exponer su rol al resto de la app.

## Historias

| HU | Descripción | Pantalla |
|---|---|---|
| HU-1 | Iniciar sesión con correo y contraseña | `LoginScreen` |
| HU-1.1 | Recuperar contraseña | `ForgotPasswordScreen` |
| HU-2 | Registrarse (nombre, apellido, correo, contraseña) | `RegisterScreen` |
| HU-3 | Cerrar sesión | Acción en `AccountScreen` |

## Contenido previsto

| Carpeta | Contenido |
|---|---|
| [`api/`](api/README.md) | `auth.api.ts`: `login`, `register`, `requestPasswordReset`, `getMe`, `refreshToken`, `logout` |
| [`components/`](components/README.md) | `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`, `AccountScreen`, `SessionProvider` |
| [`hooks/`](hooks/README.md) | `useSession`, `useLogin`, `useRegister`, `useRequestPasswordReset`, `useLogout` |
| [`schemas/`](schemas/README.md) | `login.schema.ts`, `register.schema.ts`, `forgot-password.schema.ts` |
| [`types/`](types/README.md) | `User`, `Session`, `AuthTokens`, DTO de la API |
| `constants.ts` | `AUTH_MESSAGES` con los textos exactos de los criterios de aceptación |
| `index.ts` | Exporta pantallas, `SessionProvider` y `useSession` |

## Sesión

- `SessionProvider` guarda `{ status: 'loading' | 'authenticated' | 'guest', user, role }`.
- Al iniciar la app: lee tokens de `@/lib/storage` → `getMe()` → resuelve el rol. Mientras tanto la splash sigue visible.
- Si no hay sesión, el rol efectivo es `visitor`.
- `useLogout` borra tokens, limpia la caché de servidor y deja la sesión como `guest`.
- Expone el rol a `@/permissions` mediante el provider (ver [ROLES-Y-PERMISOS](../../../docs/architecture/ROLES-Y-PERMISOS.md#5-implementación-prevista)).

## Mensajes (textuales)

| Caso | Mensaje |
|---|---|
| HU-1 credenciales incorrectas | `Correo o contraseña incorrectos.` |
| HU-1 campos vacíos | `Ambos campos son obligatorios.` |
| HU-1.1 envío (exista o no la cuenta) | `Se ha enviado un correo con las instrucciones para restablecer tu contraseña.` |
| HU-1.1 campo vacío | `Debes ingresar tu correo electrónico.` |
| HU-2 correo registrado | `Este correo ya está registrado.` |
| HU-2 campos incompletos | `Todos los campos son obligatorios.` |
| HU-2 correo inválido | `Ingresa un correo electrónico válido.` |
