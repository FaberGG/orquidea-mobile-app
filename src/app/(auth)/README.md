# src/app/(auth)/ — Rutas de acceso

**Acceso:** solo sin sesión. Protegido en el layout raíz con `<Stack.Protected guard={!isAuthenticated}>`:
un usuario con sesión no puede volver a estas pantallas.

**Responsabilidad:** rutas de la épica HE-01 (excepto cerrar sesión, que vive en `(tabs)/account.tsx`).

| Archivo | URL | Pantalla (`@/features/auth`) | HU |
|---|---|---|---|
| `_layout.tsx` | — | Stack sin pestañas | — |
| `login.tsx` | `/login` | `LoginScreen` | HU-1 |
| `register.tsx` | `/register` | `RegisterScreen` (sin encabezado, como el diseño) | HU-2 |
| `forgot-password.tsx` | `/forgot-password` | `ForgotPasswordScreen`: solicita el código (hoy solo es el destino del enlace de HU-1 CA4) | HU-1.1 |
| `reset-password.tsx` | `/reset-password?email=` | `ResetPasswordScreen`: código de 6 dígitos y nueva contraseña | HU-1.1 |

Flujos:
- Login exitoso → `router.replace('/')`.
- Registro exitoso → `router.replace({ pathname: '/login', params: { registered: 'true' } })` (el login muestra la confirmación).
- "¿Olvidaste tu contraseña?" en login → `/forgot-password` → (código enviado) `/reset-password` → (éxito) `/login`.
