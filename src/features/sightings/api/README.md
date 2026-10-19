# src/features/sightings/api/

**Responsabilidad:** llamadas a los endpoints de reportes de avistamiento mediante `@/lib/api`, con traducción
DTO ⇄ `Sighting`. Contrato: [`docs/api/reportes-avistamiento.md`](../../../../docs/api/reportes-avistamiento.md).

| Función | Endpoint | Auth | HU |
|---|---|---|---|
| `listApprovedSightings(page)` | `GET /api/reportes-avistamiento?pagina=&tamano=` | Público (`authenticated: false`) | HU-20 |
| `listPendingSightings(page)` | `GET /api/reportes-avistamiento/pendientes?pagina=&tamano=` | Admin+ | HU-19 |
| `createSighting(input)` | `POST /api/reportes-avistamiento` (`multipart/form-data`; con foto usa `uploadMultipart`) | Usuario registrado | HU-18 |
| `reviewSighting(id, 'approve' \| 'reject')` | `POST /api/reportes-avistamiento/{id}/aprobar` · `/rechazar` | Admin+ | HU-19 |

`sightings.mappers.ts` valida con `schemas/sighting-dto.schema.ts` y traduce:

| API (`OccurrenceDto`) | App (`Sighting`) |
|---|---|
| `occurrenceRemarks` | `remarks` |
| `kingdom: ANIMALIA \| PLANTAE \| FUNGI \| DESCONOCIDO` | `kingdom: animalia \| plantae \| fungi \| unknown` |
| `vernacularName` (`"Desconocido"` si no se indicó) | `vernacularName` (`null` si es desconocido) |
| `decimalLatitude`, `decimalLongitude` | `location: { latitude, longitude } \| null` |
| `recordedBy` | `author` |
| `urlFoto` | `photoUrl` |
| `estado: PENDIENTE \| APROBADO \| RECHAZADO` | `status: pending \| approved \| rejected` |
| `fechaCreacion`, `fechaRevision` | `createdAt`, `reviewedAt` |

Al crear, los opcionales vacíos no se envían (la API los completa con "Desconocido"), el reino sin elegir se
envía como `DESCONOCIDO` y las coordenadas van juntas o no van. El campo `id` (idempotencia) aún no se envía:
se usará en el envío sin conexión (HU-22).
