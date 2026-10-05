# src/features/species/api/

**Responsabilidad:** llamadas a los endpoints de fichas taxonómicas mediante `@/lib/api`, con traducción
DTO ⇄ `Species`. Contrato: [`docs/api/`](../../../../docs/api/README.md).

| Archivo | Función | Endpoint | HU | Estado |
|---|---|---|---|---|
| `species.api.ts` | `listSpecies(category)` | `GET /api/fichas-taxonomicas?categoria=AVE\|PLANTA\|INSECTO` (sin `categoria` con *Todos*) | HU-10 | ✅ |
| `species.api.ts` | `getSpecies(id)` | `GET /api/fichas-taxonomicas/{id}` | HU-10 | ✅ |
| — | `createSpecies(input)` | `POST /api/fichas-taxonomicas` (`multipart/form-data`) | HU-7 | Pendiente |
| — | `updateSpecies(id, input)` | `PUT /api/fichas-taxonomicas/{id}` | HU-8 | Pendiente |
| — | `deleteSpecies(id)` | ⛔ No existe en la API (brecha B1) | HU-9 | Bloqueada |

Listado y detalle son públicos: se llaman con `authenticated: false`. Un `404` en el detalle significa que la
ficha no existe.

`species.mappers.ts` valida la respuesta con `schemas/species-dto.schema.ts` y la traduce a `Species`.

## Traducción de campos

| API (`TaxonDto`) | App (`Species`) |
|---|---|
| `categoria: AVE \| PLANTA \| INSECTO` | `category: bird \| plant \| insect` |
| `order`, `family`, `genus`, `scientificName`, `vernacularName` | Mismo nombre |
| `alimentacion`, `rolEnHumedal` | `diet`, `wetlandRole` |
| `estadoConservacion` (UICN: `EX`…`NE`) | `conservationStatus` (mismos códigos) |
| `urlFoto` | `photoUrl` |

La API no envía **reino, filo y clase**: la sección de taxonomía del Figma muestra solo orden, familia,
género y especie.

## Errores

| Estado | Caso |
|---|---|
| 400 | Parámetros inválidos (categoría fuera de la lista) |
| 404 | La ficha no existe |
