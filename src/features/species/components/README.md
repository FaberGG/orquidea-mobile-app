# src/features/species/components/

**Responsabilidad:** pantallas y componentes visuales de las fichas taxonómicas.

| Componente | Descripción | HU | Estado |
|---|---|---|---|
| `SpeciesListScreen` | Chips de categoría + listado de `SpeciesCard`; estados de carga, error y vacío | HU-10 | ✅ |
| `CreateSpeciesButton` | Botón **+** del encabezado del listado (lo ven admin y superadmin) | HU-7 | ✅ |
| `ScanSpeciesQrButton` / `SpeciesQrScannerScreen` | Entrada universal desde Inicio y lector con permisos contextuales, validación y navegación a detalle | HU-11 | En implementación; pendiente probar dispositivo |
| `SpeciesDetailScreen` | Hero con las fotos (`SpeciesPhotoCarousel`, contador `1/n`), insignia UICN, taxonomía, alimentación, rol en el humedal (texto) y acciones con `<Can>` | HU-10, HU-8, HU-9 | ✅ (eliminar deshabilitado) |
| `SpeciesQrExport` | Panel administrativo al final de la ficha: obtener PNG, previsualizar y abrir el menú nativo para guardar/compartir | HU-11 | Pendiente prueba física |
| `SpeciesCreateScreen` | Formulario de alta; vuelve al listado al publicar. Si alguna foto adicional no se subió, lo avisa y ofrece Editar ficha | HU-7 | ✅ |
| `SpeciesEditScreen` | Carga la ficha en el formulario y guarda los cambios (texto, fotos quitadas y fotos nuevas) | HU-8 | ✅ |
| `SpeciesForm` | Formulario compartido: fotos (una o más), identificación, taxonomía, ecología y estado de conservación | HU-7, HU-8 | ✅ |
| `pickSpeciesPhotos` | Abre la galería con selección múltiple y valida cada archivo (jpg/png, 10 MB, cupo restante) | HU-7 v2.0 | ✅ (contrato inferido) |
| `SpeciesPhotosField` | Cuadrícula de fotos: la primera es la **Principal**; quitar, agregar y contador `n/10` | HU-7 v2.0 | ✅ (contrato inferido) |
| `SpeciesPhotoCarousel` | Fotos del detalle, deslizables, con contador | HU-7 v2.0 | ✅ |
| `SpeciesCard` / `CategoryChips` / `ChipButton` / `ConservationBadge` / `ConservationChip` | Piezas del listado y del detalle | HU-10 | ✅ |

`ScanSpeciesQrButton` identifica el acceso al escáner desde Inicio con el ícono `qrCode`.

## Diferencias con el diseño (pendientes de decisión)

- **Autocompletar por nombre científico** ("Auto" en Editar, sugerencias en Crear): no hay fuente de datos en la API.
- **Reino, filo y clase:** la API no los envía; el formulario solo pide orden, familia y género.
- **Grupo taxonómico** del diseño de Editar: se elige con chips de las siete categorías de la API (aves, plantas, insectos, mamíferos, reptiles, anfibios y hongos).
- **Estados ofrecidos:** CR, EN, VU, NT y LC, como en el diseño. Al editar una ficha con otro estado, ese se conserva.
- **Varias fotos (v2.0):** implementado con el contrato inferido de [`docs/api/fichas-varias-fotos.md`](../../../../docs/api/fichas-varias-fotos.md). No se puede reordenar ni elegir la principal (es la primera).
- **Iconos de botones:** los botones aún no muestran ícono (el componente `Button` no lo admite).
