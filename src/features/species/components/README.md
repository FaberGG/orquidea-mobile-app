# src/features/species/components/

**Responsabilidad:** pantallas y componentes visuales de las fichas taxonómicas.

| Componente | Descripción | HU | Estado |
|---|---|---|---|
| `SpeciesListScreen` | Chips de categoría + listado de `SpeciesCard`; estados de carga, error y vacío | HU-10 | ✅ |
| `CreateSpeciesButton` | Botón **+** del encabezado del listado (lo ven admin y superadmin) | HU-7 | ✅ |
| `SpeciesDetailScreen` | Hero con foto, insignia UICN, taxonomía, alimentación, rol en el humedal (texto) y acciones con `<Can>` | HU-10, HU-8, HU-9 | ✅ (eliminar deshabilitado) |
| `SpeciesCreateScreen` | Formulario de alta; vuelve al listado al publicar | HU-7 | ✅ |
| `SpeciesEditScreen` | Carga la ficha en el formulario y guarda los cambios | HU-8 | ✅ |
| `SpeciesForm` | Formulario compartido: foto, identificación, taxonomía, ecología y estado de conservación | HU-7, HU-8 | ✅ |
| `pickSpeciesPhoto` | Abre la galería y valida jpg/png y 10 MB | HU-7 | ✅ |
| `SpeciesCard` / `CategoryChips` / `ChipButton` / `ConservationBadge` / `ConservationChip` | Piezas del listado y del detalle | HU-10 | ✅ |

## Diferencias con el diseño (pendientes de decisión)

- **Autocompletar por nombre científico** ("Auto" en Editar, sugerencias en Crear): no hay fuente de datos en la API.
- **Reino, filo y clase:** la API no los envía; el formulario solo pide orden, familia y género.
- **Grupo taxonómico** del diseño de Editar: se elige con chips de Aves, Plantas e Insectos (la API no acepta más).
- **Estados ofrecidos:** CR, EN, VU, NT y LC, como en el diseño. Al editar una ficha con otro estado, ese se conserva.
- **Quitar foto:** el diseño lo muestra, pero la API conserva la foto actual si no se envía una nueva.
- **Iconos de botones:** los botones aún no muestran ícono (el componente `Button` no lo admite).
