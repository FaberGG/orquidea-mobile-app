# src/lib/storage/ — Almacenamiento en el dispositivo

**Responsabilidad:** persistir datos en el dispositivo con la herramienta adecuada según su sensibilidad.

## Contenido previsto

| Archivo | Contenido |
|---|---|
| `secure-storage.ts` | `getItem/setItem/deleteItem` sobre `expo-secure-store`; fallback a `localStorage` en web (ADR-0006) |
| `token-storage.ts` | `getTokens`, `saveTokens`, `clearTokens`: usado por `lib/api` y `features/auth` |
| `index.ts` | API pública |

## Reglas

- Tokens y credenciales: **solo** almacenamiento seguro.
- Guardar valores pequeños (SecureStore tiene límite por valor); el perfil del usuario se obtiene de la API.
- En HE-08 (offline) se agregará aquí el almacenamiento general para la caché persistida y la cola de sincronización.
