# src/features/species/ — Fichas taxonómicas (HE-03)

**Responsabilidad:** consulta pública de la biodiversidad del humedal (aves, plantas, insectos) y su gestión
por parte de administradores. Es el ejemplo principal de **una misma interfaz con capacidades por rol**.

## Historias

| HU | Descripción | Rol | Pantalla |
|---|---|---|---|
| HU-10 | Listado por categoría | Todos | `SpeciesListScreen`, `SpeciesDetailScreen` |
| HU-7 | Crear ficha | Admin+ | `CreateSpeciesScreen` |
| HU-8 | Editar ficha | Admin+ | `EditSpeciesScreen` |
| HU-9 | Eliminar ficha | Admin+ | Acción en `SpeciesDetailScreen` |

## Modelo

`Species`: `id`, `category` (`bird` \| `plant` \| `insect`), `order`, `family`, `genus`, `scientificName`,
`commonName`, `diet`, `wetlandRole`, `conservationStatus`, `photoUrl`.

## Contenido previsto

| Carpeta | Contenido |
|---|---|
| [`api/`](api/README.md) | `species.api.ts`: `listSpecies`, `getSpecies`, `createSpecies`, `updateSpecies`, `deleteSpecies` |
| [`components/`](components/README.md) | Pantallas, `CategorySelector`, `SpeciesCard`, `SpeciesForm`, `SpeciesActions` |
| [`hooks/`](hooks/README.md) | `useSpeciesList`, `useSpecies`, `useCreateSpecies`, `useUpdateSpecies`, `useDeleteSpecies` |
| [`schemas/`](schemas/README.md) | `species.schema.ts` |
| [`types/`](types/README.md) | `Species`, `SpeciesCategory`, DTO |
| `constants.ts` | `SPECIES_MESSAGES`, `speciesKeys`, `SPECIES_CATEGORIES`, formatos de imagen permitidos |
| `index.ts` | Exporta las pantallas |

## Visibilidad por rol

| Elemento | Permiso |
|---|---|
| Listado y detalle | `species:read` (todos) |
| Botón **Crear ficha** en el listado | `species:create` |
| Botones **Editar** / **Eliminar** en el detalle | `species:update` / `species:delete` |

## Mensajes (textuales)

| Caso | Mensaje |
|---|---|
| HU-7 campos incompletos | `Debes completar todos los campos obligatorios.` |
| HU-7 formato de imagen | `El formato de la imagen no es válido.` |
| HU-8 edición exitosa | `La ficha se actualizó correctamente.` |
| HU-10 categoría vacía | `Aún no hay especies registradas en esta categoría.` |

> HE-04 (QR) y HE-08 (offline) reutilizarán `getSpecies` y la caché de esta feature.
