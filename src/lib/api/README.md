# src/lib/api/ — Cliente HTTP

**Responsabilidad:** único punto de salida hacia la API REST. Las features construyen sus funciones (`*.api.ts`)
sobre este cliente; ningún otro lugar usa `fetch` directamente.

## Contenido

| Archivo | Contenido |
|---|---|
| `client.ts` | `apiClient.get/post/put/patch/delete` sobre `fetch`; base URL desde `@/config`; JSON y `multipart/form-data` |
| `auth-interceptor.ts` | Adjunta `Authorization: Bearer <token>`; ante `401` en una petición autenticada notifica cierre de sesión (la API no tiene renovación de token) |
| `api-error.ts` | Clase `ApiError` (`status`, `message`, `path`) construida desde `ApiErrorResponse` (`estado`, `mensaje`, `ruta`); errores de red/timeout con `status: 0`. Debe tolerar cuerpos vacíos (docs/api B4) |
| `index.ts` | API pública |

## Reglas

- El cliente no sabe de pantallas: devuelve datos o lanza `ApiError`. Conserva el `mensaje` del servidor para que
  la feature decida si lo muestra ([CODIGO §10](../../../docs/conventions/CODIGO.md#10-errores)).
- Soporta `multipart/form-data` (fichas con foto) además de JSON.
- Contrato de referencia: [`docs/api/`](../../../docs/api/README.md).
- Para avisar a la sesión de un `401` irrecuperable se usa un callback registrado (`onUnauthorized`), no un import a `features/auth`.
- Timeout por defecto configurable (red móvil inestable en el humedal).
- `request(..., { authenticated: false })` en endpoints públicos: no adjunta token y un `401` no cierra la sesión
  (en el login, `401` significa credenciales incorrectas).
- `ApiError.serverMessage` es el `mensaje` del servidor (puede faltar); `ApiError.message` es técnico y nunca se
  muestra al usuario.
- Nunca registrar en consola encabezados de autorización ni cuerpos con contraseñas.
