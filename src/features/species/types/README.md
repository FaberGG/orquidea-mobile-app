# src/features/species/types/

**Responsabilidad:** tipos del dominio de fichas taxonómicas.

| Tipo | Descripción |
|---|---|
| `SpeciesCategory` | `'bird' \| 'plant' \| 'insect'` |
| `ConservationStatus` | Valores según la escala que defina el comité (p. ej. categorías UICN) |
| `Species` | Modelo completo de la ficha |
| `SpeciesSummary` | Datos mínimos para el listado (`id`, `commonName`, `photoUrl`) |
| `SpeciesInput` | Datos del formulario (inferidos del esquema) |
| `SpeciesDto` | Forma del JSON de la API; solo se usa en `../api` |
