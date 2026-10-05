# src/features/map/ — Mapa del sendero (HE-05)

**Responsabilidad:** mapa interactivo georreferenciado con las estaciones del sendero. Es la pestaña **Mapas**.

| HU | Descripción | Rol |
|---|---|---|
| HU-12 | Ver el mapa con las estaciones (y la más cercana con geolocalización) | Todos |
| HU-13 | Crear, editar y eliminar estaciones | Admin+ |

| Archivo | Contenido |
|---|---|
| `components/map-screen.tsx` | `MapScreen`: por ahora un estado vacío que ocupa la pestaña |
| `constants.ts` | `MAP_LABELS` |
| `index.ts` | Exporta `MapScreen` |

El permiso previsto `map:manage` se agrega a la matriz cuando se implemente la épica.
