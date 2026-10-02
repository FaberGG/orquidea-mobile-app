# src/features/species/api/

**Responsabilidad:** llamadas a los endpoints de fichas taxonómicas mediante `@/lib/api`, con mapeo
DTO ⇄ `Species`.

Archivo previsto: `species.api.ts`

| Función | HU |
|---|---|
| `listSpecies({ category })` | HU-10 |
| `getSpecies(id)` | HU-10, HU-8 |
| `createSpecies(input)` | HU-7 |
| `updateSpecies(id, input)` | HU-8 |
| `deleteSpecies(id)` | HU-9 |

La foto se envía como `multipart/form-data` (o con URL prefirmada, según defina el backend). La paginación del
listado se define con el contrato de la API.
