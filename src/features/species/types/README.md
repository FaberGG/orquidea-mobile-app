# src/features/species/types/

**Responsabilidad:** tipos del dominio de fichas taxonómicas.

| Tipo | Descripción |
|---|---|
| `SpeciesCategory` | `'bird' \| 'plant' \| 'insect'` (API: `AVE`, `PLANTA`, `INSECTO`) |
| `ConservationStatus` | Códigos UICN: `'EX' \| 'EW' \| 'CR' \| 'EN' \| 'VU' \| 'NT' \| 'LC' \| 'DD' \| 'NE'`; las etiquetas en español van en `../constants.ts` |
| `Species` | Modelo completo de la ficha |
| `SpeciesSummary` | Datos mínimos para el listado (`id`, `vernacularName`, `photoUrl`) |
| `SpeciesInput` | Datos del formulario (inferidos del esquema) |
| `TaxonDto`, `TaxonRequestDto` | Forma del JSON de la API; solo se usan en `../api` |
