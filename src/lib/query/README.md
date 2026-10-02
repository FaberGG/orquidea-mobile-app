# src/lib/query/ — Caché de estado de servidor

**Responsabilidad:** crear y configurar el `QueryClient` de TanStack Query (ADR-0003) que usan los hooks de todas
las features.

## Contenido previsto

| Archivo | Contenido |
|---|---|
| `query-client.ts` | Instancia con valores por defecto: `staleTime`, reintentos (sin reintentar `4xx`), manejo de errores global |
| `focus-manager.ts` | Integración con `AppState` y conectividad para refrescar al volver a la app |
| `index.ts` | API pública |

## Reglas

- Las claves de caché **no** se definen aquí: cada feature define las suyas en su `constants.ts`.
- Al cerrar sesión (HU-3) se limpia toda la caché (`queryClient.clear()`).
- En HE-08 se agregará la persistencia de la caché para el modo offline.
