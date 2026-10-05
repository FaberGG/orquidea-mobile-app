# src/features/species/ — Fichas taxonómicas (HE-03)

**Responsabilidad:** consulta pública de la biodiversidad del humedal (listado y detalle) y, para
administradores, su edición y eliminación. Es el ejemplo principal de **una misma interfaz con capacidades
por rol**. Diseño: Figma, HE-3 → "Listar fichas" y "Detalle ficha".

## Historias

| HU | Descripción | Rol | Estado |
|---|---|---|---|
| HU-10 | Listado por categoría (chips con ícono) y detalle | Todos | ✅ Implementado (sin búsqueda: la API aún no la tiene) |
| HU-7 | Crear ficha | Admin+ | Pendiente |
| HU-8 | Editar ficha | Admin+ | Botón visible con `<Can>`; deshabilitado hasta la pantalla de edición |
| HU-9 | Eliminar ficha | Admin+ | Botón visible con `<Can>`; deshabilitado: la API no tiene `DELETE` (docs/api B1) |

## Modelo

`Species`: `id`, `category` (`bird` | `plant` | `insect`), `order`, `family`, `genus`, `scientificName`,
`vernacularName`, `diet`, `wetlandRole`, `conservationStatus`, `photoUrl`. Los campos opcionales son `null`
cuando la API los envía vacíos.

El rol en el humedal se muestra **solo como texto**: la API aún no clasifica el rol de cada especie.

## Categorías y estados de conservación

- **Chips de categoría:** Todos, Aves (`AVE`), Plantas (`PLANTA`), Insectos (`INSECTO`). Cada chip tiene su
  ícono (`LayoutGrid`, `Bird`, `Sprout`, `Bug`). Mamíferos, Reptiles y Anfibios del Figma **no** están: la API
  no los acepta (`categoria` solo admite `AVE`, `PLANTA`, `INSECTO`).
- **Estados de conservación:** los nueve códigos de la API (`EX`, `EW`, `CR`, `EN`, `VU`, `NT`, `LC`, `DD`,
  `NE`) están modelados en `CONSERVATION_STATUSES` con etiqueta y colores. Los siete del diseño usan los
  colores de la leyenda "Riesgo de extinción de especies". `DD` y `NE` no tienen color en el diseño: son
  provisionales y se confirman con diseño.

## Contenido

| Carpeta / archivo | Contenido |
|---|---|
| [`api/`](api/README.md) | `listSpecies`, `getSpecies`, mapeo DTO → `Species` |
| [`components/`](components/README.md) | Listado, detalle, tarjeta, chips y estados de conservación |
| [`hooks/`](hooks/README.md) | `useSpeciesList`, `useSpecies` |
| [`schemas/`](schemas/README.md) | Validación de `TaxonDto` |
| [`types/`](types/README.md) | `Species`, `SpeciesCategory`, `ConservationStatus` |
| `constants.ts` | `SPECIES_LABELS`, filtros de categoría, estados de conservación y claves de caché |
| `index.ts` | Exporta `SpeciesListScreen`, `SpeciesDetailScreen` y `SPECIES_LABELS` |

## Visibilidad por rol

| Elemento | Permiso |
|---|---|
| Listado y detalle | `species:read` (todos) |
| Botón **Editar ficha** en el detalle | `species:update` (admin, superadmin) |
| Botón **Eliminar ficha** en el detalle | `species:delete` (admin, superadmin) |

## Mensajes

| Caso | Mensaje |
|---|---|
| HU-10 categoría vacía | `Aún no hay especies registradas en esta categoría.` |
| HU-10 sin fichas (filtro Todos) | `Aún no hay especies registradas.` (local, no viene de una HU) |
| Ficha inexistente (404) | `Esta ficha no existe o ya no está disponible.` (local) |
| Error de carga | `No pudimos cargar las fichas. Revisa tu conexión e inténtalo de nuevo.` (local) |

> HE-04 (QR) y HE-08 (offline) reutilizarán `getSpecies` y la caché de esta feature.
