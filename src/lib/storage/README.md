# src/lib/storage/ — Almacenamiento en el dispositivo

**Responsabilidad:** persistir datos en el dispositivo con la herramienta adecuada según su sensibilidad.

## Contenido

| Archivo | Contenido |
|---|---|
| `secure-storage.ts` / `secure-storage.web.ts` | `getSecureItem/setSecureItem/deleteSecureItem` sobre `expo-secure-store`; en web, `localStorage` (ADR-0006) |
| `token-storage.ts` | `getToken`, `saveToken`, `clearToken` (un único JWT y su vencimiento `expiresAt`): usado por `lib/api` y `features/auth`. `getToken` borra y descarta tokens vencidos |
| `index.ts` | API pública |

## Reglas

- Tokens y credenciales: **solo** almacenamiento seguro.
- Guardar valores pequeños (SecureStore tiene límite por valor); el perfil del usuario se obtiene de la API.
- En HE-08 (offline) se agregará aquí el almacenamiento general para la caché persistida y la cola de sincronización.
