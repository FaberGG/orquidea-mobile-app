# src/features/map/hooks/

**Responsabilidad:** estado de servidor de las estaciones (TanStack Query, claves en `stationKeys`).

| Hook | Uso |
|---|---|
| `useStations()` | Listado |
| `useStation(id)` | Detalle |
| `useCreateStation()` | Crear; invalida `stationKeys.all` |
| `useUpdateStation(id)` | Editar; invalida `stationKeys.all` |
| `useDeleteStation(id)` | Eliminar; quita el detalle de la caché e invalida el listado |
| `getStationSaveErrorMessage` / `getStationDeleteErrorMessage` | Prefieren el `mensaje` del servidor (CODIGO §10) |

El mapa de HU-12 usa la clave independiente de `useTrailMap`; las mutaciones de estaciones invalidan el
listado y el detalle, y el mapa se refresca con su propia consulta al volver a enfocarse.
