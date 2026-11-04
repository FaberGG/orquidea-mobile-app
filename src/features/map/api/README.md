# src/features/map/api/

**Responsabilidad:** llamadas a los endpoints de estaciones mediante `@/lib/api`, con traducción DTO ⇄ `Station`.
El backend (SCRUM-40) aún no existe: el contrato es **inferido** y está en
[`docs/api/estaciones.md`](../../../../docs/api/estaciones.md).

| Función | Endpoint | HU |
|---|---|---|
| `listStations()` | `GET /api/estaciones` (público) | HU-12/13 |
| `getStation(id)` | `GET /api/estaciones/{id}` (público; `404` si no existe) | HU-13 |
| `createStation(input)` | `POST /api/estaciones` (`multipart/form-data`, foto obligatoria en `foto`) | HU-13 CA1/CA4 |
| `updateStation(id, input)` | `PUT /api/estaciones/{id}` (foto opcional; las fichas se reemplazan) | HU-13 CA2 |
| `deleteStation(id)` | `DELETE /api/estaciones/{id}` → `204` | HU-13 CA5 |

## Traducción de campos

| API (`EstacionDto`) | App (`Station`) |
|---|---|
| `nombre`, `descripcion` | `name`, `description` |
| `urlFoto` | `photoUrl` |
| `decimalLatitude`, `decimalLongitude` | `location: { latitude, longitude }` |
| `fichas: [{ id, vernacularName, urlFoto }]` | `species: [{ id, vernacularName, photoUrl }]` |

Al enviar, `fichaIds` va como **un solo campo separado por comas** (`id1,id2`), porque la subida nativa no
permite repetir un campo. Sin fichas no se envía.
