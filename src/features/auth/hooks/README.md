# src/features/auth/hooks/

**Responsabilidad:** conectar las pantallas con la API y la sesión. Aquí se traducen los errores de la API a
mensajes según [CODIGO §10](../../../../docs/conventions/CODIGO.md#10-errores): `mensaje` del servidor o, como respaldo, `../constants.ts`.

| Hook | Descripción |
|---|---|
| `useSession` | Lee el contexto de sesión: `status`, `user`, `role`, `isAuthenticated` |
| `useLogin` | Mutation de login: guarda el token, actualiza la sesión y navega a `/` |
| `useRegister` | Mutation de registro: al éxito navega a `/login` |
| `useRequestPasswordReset` | Solicita el código; muestra siempre el mismo mensaje de éxito (HU-1.1 CA2) |
| `useResetPassword` | Envía código y nueva contraseña; si el código es inválido o venció, muestra el `mensaje` del servidor |
| `useLogout` | Borra el token, limpia la caché y deja la sesión como visitante |
