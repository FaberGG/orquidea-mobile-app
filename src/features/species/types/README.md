# src/features/species/types/

**Responsabilidad:** tipos del dominio de fichas taxonómicas (`species.ts`, reexportado por `index.ts`).

| Tipo | Descripción |
|---|---|
| `SpeciesCategory` | `'bird' \| 'plant' \| 'insect' \| 'mammal' \| 'reptile' \| 'amphibian' \| 'fungus'` (API: `AVE`, `PLANTA`, `INSECTO`, `MAMIFERO`, `REPTIL`, `ANFIBIO`, `HONGO`) |
| `ConservationStatus` | Códigos UICN de `CONSERVATION_CODES` (`EX`, `EW`, `CR`, `EN`, `VU`, `NT`, `LC`, `DD`, `NE`); etiquetas y colores en `../constants.ts` |
| `Species` | Modelo de una ficha para la app; `photoUrl` es la principal y `photos` todas, en orden |
| `SpeciesPhotoItem` | Foto guardada: `id` (`null` si la API aún no envía `fotos`) y `url` |
| `SpeciesInput` | Cuerpo de crear y editar: campos de texto, `newPhotos` y `removedPhotoIds` |
