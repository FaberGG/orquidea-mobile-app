# src/features/offline/ — Sincronización offline (HE-08)

**Responsabilidad:** reunir las fuentes de datos offline de las demás features y mantener actualizada la copia
del dispositivo (HU-21), mostrar su estado y avisar de los cambios de conexión. Guía completa: [docs/architecture/OFFLINE.md](../../../docs/architecture/OFFLINE.md).

## Contenido

| Archivo | Contenido |
|---|---|
| `constants.ts` | `OFFLINE_SOURCES`: fuentes registradas (`speciesOfflineSource`, `stationsOfflineSource`) |
| `configure-offline-queries.ts` | `configureOfflineQueries(queryClient)`: marca como persistentes los prefijos de las fuentes |
| `constants.ts` (además) | `OFFLINE_MESSAGES` (toasts), `OFFLINE_CONTENT_LABELS` (pantalla), `OFFLINE_RECONNECT_SETTLE_MS`, `OFFLINE_RESYNC_INTERVAL_MS`. Textos provisionales: pendientes de aprobar en HU-21 |
| `sync-offline-sources.ts` | `syncOfflineSources(queryClient, { sources?, signal? })`: descarga datos, fotos y poda archivos sobrantes; publica el progreso en `offline-sync-status` y marca el backend como inalcanzable ante fallos `network`/`timeout` |
| `watch-backend-reachability.ts` | `watchBackendReachability(queryClient)`: observa queries y mutaciones para saber si el backend responde |
| `components/offline-sync.tsx` | `<OfflineSync />`: sincroniza al abrir la app, al reconectar (tras estabilizarse la red), al volver a primer plano si la copia es vieja y cuando se pide con `requestOfflineSync`. Cancela al perder la red |
| `components/connectivity-notice.tsx` | `<ConnectivityNotice />`: toasts de conexión perdida/restablecida y de contenido actualizado |
| `components/offline-content-screen.tsx` | `OfflineContentScreen` (`/offline-downloads`, "Contenido sin conexión"): estado, fichas descargadas, estaciones, mapa en desarrollo |
| `index.ts` | API pública |
| `__tests__/` | Pruebas de la sincronización |

`AppProviders` llama a `configureOfflineQueries` y `watchBackendReachability`, y monta `<OfflineSync />` y
`<ConnectivityNotice />`.

## Agregar una fuente

1. La feature exporta un `OfflineSource` (tipo de `@/lib/offline`) desde su `index.ts`.
2. Se añade a `OFFLINE_SOURCES` en `constants.ts`.

## Reglas

- Importa otras features solo por su `index.ts`.
- Un fallo de una fuente no detiene las demás; la carpeta de archivos de una fuente fallida no se poda.
