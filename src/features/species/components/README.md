# src/features/species/components/

**Responsabilidad:** pantallas y componentes visuales de las fichas taxonómicas.

| Componente | Descripción | HU | Estado |
|---|---|---|---|
| `SpeciesListScreen` | Chips de categoría + listado de `SpeciesCard`; estados de carga, error y vacío | HU-10 | ✅ |
| `SpeciesDetailScreen` | Hero con foto, insignia UICN, taxonomía, alimentación, rol en el humedal (texto) y acciones con `<Can>` | HU-10, HU-8, HU-9 | ✅ (acciones deshabilitadas) |
| `SpeciesCard` | Foto, nombre común, código UICN, nombre científico y chips | HU-10 | ✅ |
| `CategoryChips` / `ChipButton` | Filtro por categoría; cada chip con su ícono | HU-10 | ✅ |
| `ConservationBadge` / `ConservationChip` | Insignia circular y chip con el color del nivel | HU-10 | ✅ |
| `SpeciesForm` | Formulario de crear/editar con selector de foto | HU-7, HU-8 | Pendiente |
