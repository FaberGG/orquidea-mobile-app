# src/features/auth/hooks/

**Responsabilidad:** conectar las pantallas con la API y la sesión. Aquí se traducen los errores de la API a
los mensajes textuales de `../constants.ts`.

| Hook | Descripción |
|---|---|
| `useSession` | Lee el contexto de sesión: `status`, `user`, `role`, `isAuthenticated` |
| `useLogin` | Mutation de login: guarda tokens, actualiza sesión y navega a `/` |
| `useRegister` | Mutation de registro: al éxito navega a `/login` |
| `useRequestPasswordReset` | Mutation de recuperación; muestra siempre el mismo mensaje de éxito (HU-1.1 CA2) |
| `useLogout` | Borra tokens, limpia caché y deja la sesión como visitante |
