# src/features/map/hooks/

**Responsabilidad:** estado de servidor de las estaciones (TanStack Query, claves en `stationKeys`).

| Hook | Uso |
|---|---|
| `prefetchStationsForOffline` / `stationsOfflineSource` | HU-21: descarga estaciones, siembra detalles y devuelve las URLs de fotos (foto y miniatura de cada estación y miniaturas de sus fichas). Lo registra `features/offline` |
| `useStations()` | Listado |
| `useStation(id)` | Detalle |
| `useCreateStation()` | Crear; invalida `stationKeys.all` |
| `useUpdateStation(id)` | Editar; invalida `stationKeys.all` |
| `useDeleteStation(id)` | Eliminar; quita el detalle de la caché e invalida el listado |
| `getStationSaveErrorMessage` / `getStationDeleteErrorMessage` | Prefieren el `mensaje` del servidor (CODIGO §10) |
| `useOfflineTiles(enabled)` | SCRUM-85: URL `pmtiles://file:///…` del mapa base offline incluido en la app (`loading` / `ready` / `error`). La usan el selector de ubicación y el cambio automático de fuente del mapa (tarea 5) |

El mapa de HU-12 usa la clave independiente de `useTrailMap`; las mutaciones de estaciones invalidan el
listado y el detalle, y el mapa se refresca con su propia consulta al volver a enfocarse.
