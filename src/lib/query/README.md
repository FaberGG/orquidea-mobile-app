# src/lib/query/ — Caché de estado de servidor

**Responsabilidad:** crear y configurar el `QueryClient` de TanStack Query (ADR-0003) que usan los hooks de todas
las features.

## Contenido

| Archivo | Contenido |
|---|---|
| `query-client.ts` | Instancia con valores por defecto: `staleTime`, reintentos (sin reintentar `4xx`), manejo de errores global |
| `focus-manager.ts` | `connectFocusManager()`: conecta el `focusManager` con `AppState`; al volver la app al primer plano se refrescan las queries activas vencidas. La red se vuelve a leer en `connectOnlineManager` (`../offline/`) |
| `index.ts` | API pública |

## Reglas

- Las claves de caché **no** se definen aquí: cada feature define las suyas en su `constants.ts`.
- Al cerrar sesión (HU-3) se limpia toda la caché (`queryClient.clear()`).
- La persistencia offline (HE-08) vive en [`../offline/`](../offline/README.md): solo se guardan las queries
  marcadas `meta.persist` y `AppProviders` usa `PersistQueryClientProvider` (ADR-0017).
