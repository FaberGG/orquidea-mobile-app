# src/features/species/types/

**Responsabilidad:** tipos del dominio de fichas taxonómicas (`species.ts`, reexportado por `index.ts`).

| Tipo | Descripción |
|---|---|
| `SpeciesCategory` | `'bird' \| 'plant' \| 'insect'` (API: `AVE`, `PLANTA`, `INSECTO`) |
| `ConservationStatus` | Códigos UICN de `CONSERVATION_CODES` (`EX`, `EW`, `CR`, `EN`, `VU`, `NT`, `LC`, `DD`, `NE`); etiquetas y colores en `../constants.ts` |
| `Species` | Modelo de una ficha para la app |
