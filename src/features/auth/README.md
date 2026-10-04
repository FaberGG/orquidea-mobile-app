# src/features/auth/ — Acceso y sesión (HE-01)

**Responsabilidad:** identificar al usuario, mantener su sesión y exponer su rol al resto de la app.

## Estado

| HU | Estado |
|---|---|
| HU-1 | ✅ Implementada (`feature/inicio-de-sesion`) |
| HU-1.1 | ✅ Implementada (`feature/recuperar-contrasena`), flujo de dos pasos con código de 6 dígitos; sin diseño en Figma (sigue el estilo del login) |
| HU-2 | ✅ Implementada (`feature/registro`), diseño Figma nodo `44:468` |
| HU-3 | Pendiente |

Diseño: Figma "Humedal Orquidea", sección **HE-1 Registro y Autenticacion** (login: nodo `43:229`). Donde el
Figma y los criterios de aceptación difieren, mandan los criterios: botón **INGRESAR** (Figma: "Iniciar Sesion") y
enlace **¿Olvidaste tu contraseña?** (Figma: "Olvido su contraseña?"). Los textos están en `AUTH_LABELS`.

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

- `SessionProvider` expone `{ status: 'loading' | 'authenticated' | 'guest', user, signIn, signOut }`; `useSession()` agrega
  `isAuthenticated` y `role`.
- El usuario vive en la caché de servidor bajo `authKeys.me()`: iniciar o cerrar sesión es actualizar esa entrada.
- Al iniciar la app: lee el token de `@/lib/storage` → `getMe()` → resuelve el rol. Mientras tanto la splash sigue visible.
  Si no hay red o la API falla con algo distinto de `401`, la sesión arranca como visitante pero el token se conserva
  para reintentar en el siguiente arranque.
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
| HU-1 sin conexión / error inesperado (respaldo local) | `No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.` / `Ocurrió un error inesperado. Inténtalo de nuevo.` |
| HU-1.1 envío (exista o no la cuenta) | `Se ha enviado un correo con las instrucciones para restablecer tu contraseña.` (texto de la HU; ajustarlo si el PO lo alinea con el flujo de código, ver docs/api B5). Se muestra en el paso 2 |
| HU-1.1 paso 2 (locales) | `Todos los campos son obligatorios.` · `El código debe tener 6 dígitos.` · `Las contraseñas no coinciden.` · `Código incorrecto o vencido.` (respaldo si el `400` no trae `mensaje`) |
| HU-1.1 éxito (en el login) | `Tu contraseña fue actualizada. Inicia sesión con tu nueva contraseña.` |
| HU-1.1 campo vacío | `Debes ingresar tu correo electrónico.` |
| HU-2 correo registrado | `Este correo ya está registrado.` |
| HU-2 campos incompletos | `Todos los campos son obligatorios.` |
| HU-2 correo inválido | `Ingresa un correo electrónico válido.` |
| HU-2 éxito (en el login) | `Tu cuenta fue creada. Revisa tu correo e inicia sesión.` (local) |
| HU-2 reglas sin CA | `El nombre y el apellido deben tener al menos 2 caracteres.` (contrato) · `Las contraseñas no coinciden.` · `Debes aceptar los términos y condiciones y la política de privacidad.` (diseño) |

HU-2: el `409` siempre muestra el texto del criterio (el contrato documenta "El correo electrónico ya está registrado.").
El Figma agrega **Confirmar contraseña** (solo se valida en la app; la API recibe una contraseña) y la casilla de
**términos y política de privacidad** (consentimiento de la Ley 1581; aún no existen esos documentos, por eso no enlazan).
