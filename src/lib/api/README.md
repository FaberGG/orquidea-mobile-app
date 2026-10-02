# src/lib/api/ — Cliente HTTP

**Responsabilidad:** único punto de salida hacia la API REST. Las features construyen sus funciones (`*.api.ts`)
sobre este cliente; ningún otro lugar usa `fetch` directamente.

## Contenido previsto

| Archivo | Contenido |
|---|---|
| `client.ts` | `apiClient.get/post/put/patch/delete` sobre `fetch`; base URL desde `@/config`; JSON y `multipart/form-data` |
| `auth-interceptor.ts` | Adjunta `Authorization: Bearer`; ante `401` intenta *refresh* una vez y, si falla, notifica cierre de sesión |
| `api-error.ts` | Clase `ApiError` (`status`, `code`, `message`, `details`) y normalización de errores de red/timeout |
| `types.ts` | Tipos genéricos de respuesta (paginación, error) si no se usan `@/types` |
| `index.ts` | API pública |

## Reglas

- El cliente no sabe de pantallas ni de mensajes: devuelve datos o lanza `ApiError`.
- Para avisar a la sesión de un `401` irrecuperable se usa un callback registrado (`onUnauthorized`), no un import a `features/auth`.
- Timeout por defecto configurable (red móvil inestable en el humedal).
- Nunca registrar en consola encabezados de autorización ni cuerpos con contraseñas.
