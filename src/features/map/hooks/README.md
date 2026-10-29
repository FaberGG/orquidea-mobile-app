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

Cuando exista el mapa (HU-12, `GET /api/mapa`), las mutaciones también deben invalidar su clave.
