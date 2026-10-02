# src/features/auth/ — Acceso y sesión (HE-01)

**Responsabilidad:** identificar al usuario, mantener su sesión y exponer su rol al resto de la app.

## Historias

| HU | Descripción | Pantalla |
|---|---|---|
| HU-1 | Iniciar sesión con correo y contraseña | `LoginScreen` |
| HU-1.1 | Recuperar contraseña (dos pasos: solicitar código y restablecer) | `ForgotPasswordScreen`, `ResetPasswordScreen` |
| HU-2 | Registrarse (nombre, apellido, correo, contraseña) | `RegisterScreen` |
| HU-3 | Cerrar sesión | Acción en `AccountScreen` |

## Contenido previsto

| Carpeta | Contenido |
|---|---|
| [`api/`](api/README.md) | `auth.api.ts`: `login`, `getMe`, `requestPasswordReset`, `resetPassword`, `register` |
| [`components/`](components/README.md) | `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`, `ResetPasswordScreen`, `AccountScreen`, `SessionProvider` |
| [`hooks/`](hooks/README.md) | `useSession`, `useLogin`, `useRegister`, `useRequestPasswordReset`, `useResetPassword`, `useLogout` |
| [`schemas/`](schemas/README.md) | `login.schema.ts`, `register.schema.ts`, `forgot-password.schema.ts`, `reset-password.schema.ts` |
| [`types/`](types/README.md) | `User`, `Session`, `AuthToken`, DTO de la API |
| `constants.ts` | `AUTH_MESSAGES` con los textos exactos de los criterios de aceptación |
| `index.ts` | Exporta pantallas, `SessionProvider` y `useSession` |

## Sesión

- `SessionProvider` guarda `{ status: 'loading' | 'authenticated' | 'guest', user, role }`.
- Al iniciar la app: lee el token de `@/lib/storage` → `getMe()` → resuelve el rol. Mientras tanto la splash sigue visible.
- La API entrega **un único JWT** sin renovación. Si vence (`401`), se borra y la sesión pasa a `guest`.
- Si no hay sesión, el rol efectivo es `visitor`.
- `useLogout` borra el token, limpia la caché de servidor y deja la sesión como `guest` (no hay endpoint de logout).
- Expone el rol a `@/permissions` mediante el provider (ver [ROLES-Y-PERMISOS](../../../docs/architecture/ROLES-Y-PERMISOS.md#5-implementación-prevista)).

## Mensajes (textuales)

Se guardan en `constants.ts` para las validaciones del cliente y como respaldo; los errores de la API se
muestran con su `mensaje`, que coincide con estos textos (ver [CODIGO §10](../../../docs/conventions/CODIGO.md#10-errores)).

| Caso | Mensaje |
|---|---|
| HU-1 credenciales incorrectas | `Correo o contraseña incorrectos.` |
| HU-1 campos vacíos | `Ambos campos son obligatorios.` |
| HU-1.1 envío (exista o no la cuenta) | `Se ha enviado un correo con las instrucciones para restablecer tu contraseña.` (texto de la HU; ajustarlo si el PO lo alinea con el flujo de código, ver docs/api B5) |
| HU-1.1 campo vacío | `Debes ingresar tu correo electrónico.` |
| HU-2 correo registrado | `Este correo ya está registrado.` |
| HU-2 campos incompletos | `Todos los campos son obligatorios.` |
| HU-2 correo inválido | `Ingresa un correo electrónico válido.` |
