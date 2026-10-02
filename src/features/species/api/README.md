# src/features/species/api/

**Responsabilidad:** llamadas a los endpoints de fichas taxonómicas mediante `@/lib/api`, con traducción
DTO ⇄ `Species`. Contrato: [`docs/api/`](../../../../docs/api/README.md).

Archivo previsto: `species.api.ts`

| Función | Endpoint | HU |
|---|---|---|
| `listSpecies({ category? })` | `GET /api/fichas-taxonomicas?categoria=AVE\|PLANTA\|INSECTO` (sin categoría lista todas; sin paginación) | HU-10 |
| `getSpecies(id)` | `GET /api/fichas-taxonomicas/{id}` | HU-10, HU-8 |
| `createSpecies(input)` | `POST /api/fichas-taxonomicas` (`multipart/form-data`, foto obligatoria) | HU-7 |
| `updateSpecies(id, input)` | `PUT /api/fichas-taxonomicas/{id}` (`multipart/form-data`; sin foto se conserva la actual) | HU-8 |
| `deleteSpecies(id)` | ⛔ No existe en la API (brecha B1) | HU-9 |

Listado y detalle son públicos (sin token); crear y editar requieren rol administrador.

## Traducción de campos

| API (`TaxonDto` / `TaxonRequest`) | App (`Species`) |
|---|---|
| `categoria: AVE \| PLANTA \| INSECTO` | `category: bird \| plant \| insect` |
| `order`, `family`, `genus`, `scientificName`, `vernacularName` | Mismo nombre |
| `alimentacion`, `rolEnHumedal` | `diet`, `wetlandRole` |
| `estadoConservacion` (UICN: `EX`…`NE`) | `conservationStatus` (mismos códigos) |
| `foto` (envío) / `urlFoto` (respuesta) | `photo` (archivo local) / `photoUrl` |
| `fechaCreacion`, `fechaActualizacion` | `createdAt`, `updatedAt` |

## Errores

| Estado | Caso |
|---|---|
| 400 | Campos obligatorios o formato de imagen inválido |
| 404 | La ficha no existe |
| 409 | Ya existe una ficha con ese nombre científico |
| 413 | La imagen supera 10 MB |
