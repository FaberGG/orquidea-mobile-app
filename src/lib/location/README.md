# src/lib/location/ — Ubicación del dispositivo

**Responsabilidad:** leer la posición actual con `expo-location` (ADR-0013), sin conocer el dominio.

| Archivo | Contenido |
|---|---|
| `get-current-location.ts` | `getCurrentLocation()`: pide permiso en primer plano y devuelve `located` (con `Coordinates`), `denied` o `error` |

La usan el lugar de un avistamiento (HU-18, `features/sightings`) y las coordenadas de una estación (HU-13,
`features/map`). Quien llama muestra los mensajes al usuario.
