# src/features/map/ — Mapa del sendero (HE-05)

**Responsabilidad:** mapa interactivo georreferenciado con las estaciones del sendero (pestaña **Mapas**) y la
gestión de esas estaciones.

| HU | Descripción | Rol | Estado |
|---|---|---|---|
| HU-12 | Ver el mapa con las estaciones (y la más cercana con geolocalización) | Todos | Pendiente: `MapScreen` es un estado vacío |
| HU-13 | Crear, editar y eliminar estaciones; "Ver estación" con sus fichas | Admin+ (gestión) · Todos (consulta) | ✅ Con **contrato inferido** ([`docs/api/estaciones.md`](../../../docs/api/estaciones.md)) |

## Flujo provisional de HU-13

El mapa (HU-12) aún no existe. Para llegar a "Ver estación" sin él, el menú lateral tiene **Estaciones del
sendero** (`/stations`, todos los roles):

```
Menú lateral → /stations (listado) → /stations/:id ("Ver estación") → Editar (/stations/:id/edit) · ELIMINAR
                └─ + (stations:manage) → /stations/new
```

Cuando exista el mapa, tocar una estación abrirá `/stations/:id`. El listado del menú puede retirarse o quedar
como vista alternativa, según se decida en UI/UX.

| Carpeta | Contenido |
|---|---|
| [`api/`](api/README.md) | `listStations`, `getStation`, `createStation`, `updateStation`, `deleteStation` y mapeos |
| [`hooks/`](hooks/README.md) | Consultas y mutaciones con TanStack Query |
| [`schemas/`](schemas/README.md) | `EstacionDto` y formulario de estación |
| [`types/`](types/README.md) | `Station`, `StationSpecies`, `StationInput`, `StationPhoto` |
| [`components/`](components/README.md) | Pantallas y piezas |
| `constants.ts` | `MAP_LABELS`, `STATION_LABELS`, `STATION_MESSAGES` (textos de los criterios), `STATION_LIMITS`, `stationKeys` |
| `index.ts` | Exporta `MapScreen` y las cuatro pantallas de estaciones |

**Permiso:** `stations:manage` (admin y superadmin) para **+**, **Editar estación** y **ELIMINAR**. Las rutas de
crear y editar viven en `src/app/(admin)/stations/`.

**Dependencias:** usa `useSpeciesList` del barrel de `@/features/species` para el selector de fichas, y
`getCurrentLocation` de `@/lib/location` para "Usar mi ubicación actual".
