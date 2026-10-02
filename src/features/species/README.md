# src/features/species/ — Fichas taxonómicas (HE-03)

**Responsabilidad:** consulta pública de la biodiversidad del humedal (aves, plantas, insectos) y su gestión
por parte de administradores. Es el ejemplo principal de **una misma interfaz con capacidades por rol**.

## Historias

| HU | Descripción | Rol | Pantalla |
|---|---|---|---|
| HU-10 | Listado por categoría | Todos | `SpeciesListScreen`, `SpeciesDetailScreen` |
| HU-7 | Crear ficha | Admin+ | `CreateSpeciesScreen` |
| HU-8 | Editar ficha | Admin+ | `EditSpeciesScreen` |
| HU-9 | Eliminar ficha ⛔ | Admin+ | Acción en `SpeciesDetailScreen` |

⛔ **HU-9 bloqueada:** la API no tiene `DELETE /api/fichas-taxonomicas/{id}`
([docs/api B1](../../../docs/api/README.md#5-brechas-con-las-historias-de-usuario)).

## Modelo

`Species`: `id`, `category` (`bird` \| `plant` \| `insect`), `order`, `family`, `genus`, `scientificName`,
`vernacularName` (nombre común), `diet`, `wetlandRole`, `conservationStatus` (UICN), `photoUrl`, `createdAt`,
`updatedAt`.

Los campos taxonómicos usan los nombres Darwin Core del contrato; el resto se traduce del español
(ver [docs/api §3](../../../docs/api/README.md#3-traducción-contrato--app)).

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

Se guardan en `constants.ts` para las validaciones del cliente y como respaldo; los errores de la API se
muestran con su `mensaje`, que coincide con estos textos (ver [CODIGO §10](../../../docs/conventions/CODIGO.md#10-errores)).

| Caso | Mensaje |
|---|---|
| HU-7 campos incompletos | `Debes completar todos los campos obligatorios.` |
| HU-7 formato de imagen | `El formato de la imagen no es válido.` |
| Contrato: nombre científico duplicado (409) | Mensaje del servidor |
| Contrato: imagen mayor a 10 MB (413) | Mensaje del servidor |
| HU-8 edición exitosa | `La ficha se actualizó correctamente.` |
| HU-10 categoría vacía | `Aún no hay especies registradas en esta categoría.` |

> HE-04 (QR) y HE-08 (offline) reutilizarán `getSpecies` y la caché de esta feature.
