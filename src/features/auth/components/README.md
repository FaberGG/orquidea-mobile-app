# src/features/auth/components/

**Responsabilidad:** pantallas y componentes visuales propios del acceso.

| Componente | Descripción | HU |
|---|---|---|
| `LoginScreen` | Formulario de correo y contraseña, botón **INGRESAR**, enlace "¿Olvidaste tu contraseña?" y enlace a registro | HU-1 |
| `ForgotPasswordScreen` | Campo de correo y botón **ENVIAR**; al éxito navega a `ResetPasswordScreen` | HU-1.1 |
| `ResetPasswordScreen` | Código de 6 dígitos y nueva contraseña; al éxito vuelve a `LoginScreen` | HU-1.1 |
| `RegisterScreen` | Nombre, apellido, correo, contraseña y botón **REGISTRARME** | HU-2 |
| `AccountScreen` | Visitante: invitación a ingresar o registrarse. Con sesión: datos del usuario, botón **CERRAR SESIÓN** y, con `<Can permission="admins:read">`, acceso a gestión de administradores | HU-3 |
| `SessionProvider` | Context de sesión (estado, usuario, rol, acciones) | HU-1, HU-3 |

Las pantallas obtienen datos y acciones de `../hooks`; los campos de formulario usan los componentes de
`@/components/ui`.
