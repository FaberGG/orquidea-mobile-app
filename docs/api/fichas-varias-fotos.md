# Varias fotos por ficha taxonómica (HU-7 v2.0): contrato inferido

> **Estado:** implementado en el frontend (rama `feature/varias-fotos-ficha`, tarea
> [SCRUM-51](https://humedal-orquidea.atlassian.net/browse/SCRUM-51)) **antes** de que exista en el backend
> ([SCRUM-47](https://humedal-orquidea.atlassian.net/browse/SCRUM-47)). El contrato de este documento parte de la
> sugerencia de SCRUM-47 y lo completa con las decisiones que el frontend necesitó tomar. Si el backend lo
> implementa distinto, la sección [Si el contrato cambia](#si-el-contrato-cambia) lista qué archivos tocar.

## Criterio de aceptación

> 4. Varias fotos: en caso de adjuntar más de una foto en formato permitido (jpg, png) → clic GUARDAR FICHA → el
>    sistema guarda todas las fotos en la ficha y usa la primera como foto principal del listado.

Se mantiene el CA3: 'El formato de la imagen no es válido.'

## Contrato que espera la app

Sigue el patrón de los componentes del humedal (`ComponentPhotoDto`, `POST/DELETE /api/componentes/{tipo}/fotos`).

### `TaxonDto`

```jsonc
{
  "id": "5b0c7f0e-…",
  // …campos actuales sin cambios…
  "urlFoto": "http://…/f1.jpg", // se mantiene: siempre igual a fotos[0].url (o null si no hay fotos)
  "fotos": [                     // NUEVO: en orden de carga; la primera es la principal
    { "id": "uuid-f1", "url": "http://…/f1.jpg" },
    { "id": "uuid-f2", "url": "http://…/f2.jpg" }
  ]
}
```

### Endpoints

| Método y ruta | Auth | Cuerpo | Respuesta | Errores |
|---|---|---|---|---|
| `POST /api/fichas-taxonomicas` | Admin+ | `multipart/form-data`: campos de texto de `TaxonRequest` + **`fotos`** (uno o más archivos; el campo se repite por archivo) | `201` `TaxonDto` | `400` sin fotos o formato inválido · `409` nombre científico duplicado o más de 10 fotos · `413` archivo > 10 MB |
| `POST /api/fichas-taxonomicas/{id}/fotos` | Admin+ | `multipart/form-data` con **un** archivo en el campo **`foto`** | `201` `TaxonDto` con la lista de fotos actualizada; la foto nueva va **al final** | `400` formato · `404` ficha · `409` ya tiene 10 fotos · `413` |
| `DELETE /api/fichas-taxonomicas/{id}/fotos/{idFoto}` | Admin+ | — | `204` | `404` ficha o foto · `409` es la única foto de la ficha |
| `PUT /api/fichas-taxonomicas/{id}` | Admin+ | `multipart/form-data` **solo con texto** | `200` `TaxonDto` | Los actuales. **No modifica las fotos** si no llega archivo |

Reglas:

- **Límite:** 10 fotos por ficha, igual que los componentes.
- **Orden:** el de carga. Al borrar la principal, la siguiente pasa a ser la principal, y `urlFoto` se actualiza.
- **Mínimo:** la ficha siempre tiene al menos una foto. Crear sin fotos responde `400` "Debes seleccionar una
  imagen."; borrar la última responde `409`.
- **Archivos:** jpg o png de 10 MB como máximo cada uno, como hoy.
- **Errores:** el cuerpo es `ApiErrorResponse` con `mensaje`; la app muestra ese texto.

### Por qué la app crea con una sola foto

La app sube archivos con `File.upload` de `expo-file-system` (`src/lib/api/multipart.ts`), que envía **un archivo
por petición**. Se usa porque `fetch` + `FormData` no lee bien en Android los archivos que devuelve el selector de
imágenes. Por eso la app:

1. Crea la ficha con `POST /api/fichas-taxonomicas`, con la **primera** foto en el campo `fotos`. Spring enlaza
   una sola parte con `List<MultipartFile> fotos`.
2. Sube cada foto restante, en orden, con `POST /api/fichas-taxonomicas/{id}/fotos` (campo `foto`).

El backend debe aceptar `fotos` con uno o varios archivos. Para la app, basta con que acepte uno.

**Fallo parcial:** si falla una foto adicional, la ficha ya existe. La app no reintenta la creación, porque
respondería `409` por nombre científico duplicado. En su lugar avisa "La ficha se creó, pero no pudimos subir N
fotos…" y ofrece ir a **Editar ficha** para completarlas.

### Edición (HU-8)

Al guardar, la app aplica los cambios en este orden:

1. `PUT /{id}` con el texto, sin archivos.
2. `DELETE /{id}/fotos/{idFoto}` por cada foto quitada. Va primero para no chocar con el límite de 10.
3. `POST /{id}/fotos` por cada foto nueva.
4. `GET /{id}` para mostrar el estado real.

Si un paso falla, los anteriores quedan guardados: la app recuerda qué fotos ya se quitaron o se subieron para no
repetirlas al reintentar.

### Compatibilidad con la API actual

Si `TaxonDto` todavía no trae `fotos`, la app usa `urlFoto` como única foto, con `id: null`. Esa foto se muestra,
pero no se puede quitar por separado. Crear sí requiere el backend nuevo, porque la API actual espera el campo
`foto`, no `fotos`. **Por eso la rama se debe unir a `dev` cuando SCRUM-47 esté desplegado.**

## Implementación en la app

| Archivo | Qué hace |
|---|---|
| `src/features/species/schemas/species-dto.schema.ts` | `taxonPhotoDtoSchema` y `fotos` (opcional) en `taxonDtoSchema` |
| `src/features/species/types/species.ts` | `SpeciesPhotoItem` (`id \| null`, `url`), `Species.photos` y `SpeciesInput.newPhotos` / `removedPhotoIds` |
| `src/features/species/api/species.mappers.ts` | `fotos → photos`; `photoUrl` = primera foto (respaldo: `urlFoto`) |
| `src/features/species/api/species.api.ts` | `createSpecies` (crear con la primera foto y luego agregar el resto; devuelve `pendingPhotos`), `addSpeciesPhoto`, `deleteSpeciesPhoto` y `updateSpecies` (texto → quitar → agregar → releer) |
| `src/features/species/hooks/use-species-mutations.ts` | `useUpdateSpecies` recibe `{ input, progress }` e invalida la caché también al fallar |
| `src/features/species/schemas/species-form.schema.ts` | `SPECIES_PHOTO_LIMIT = 10`; `newPhotos` y `removedPhotoIds` en el formulario |
| `src/features/species/components/pick-species-photo.ts` | Selección múltiple (`allowsMultipleSelection`, `selectionLimit`) y validación de cada archivo |
| `src/features/species/components/species-photos-field.tsx` | Cuadrícula de fotos con "Principal", quitar, agregar y contador `n/10` |
| `src/features/species/components/species-form.tsx` | Estado de fotos, validación (al menos una al crear) y avisos de progreso |
| `src/features/species/components/species-create-screen.tsx` | Aviso de fotos pendientes después de crear |
| `src/features/species/components/species-edit-screen.tsx` | Pasa las fotos guardadas y el progreso |
| `src/features/species/components/species-photo-carousel.tsx` | Carrusel del detalle con contador `1/n` |
| `src/features/species/constants.ts` | Etiquetas y mensajes (`photoLimitReached`, `photosPartiallySaved`) |

Pruebas: `api/species.api.test.ts` (orden de las peticiones, campos `fotos` y `foto`, fallo parcial),
`api/species.mappers.test.ts`, `components/species-form.test.tsx` y `components/species-screens.test.tsx`.

## Si el contrato cambia

| Si el backend… | Cambiar |
|---|---|
| Nombra distinto la lista o sus campos (p. ej. `imagenes`, `urlImagen`) | `species-dto.schema.ts` y `toSpeciesPhotos` en `species.mappers.ts` |
| Usa otro campo de archivo al crear (`foto`, `imagenes`…) | Último argumento de `uploadMultipart` en `createSpecies` (`species.api.ts`) |
| Usa otro campo o ruta para agregar fotos | `addSpeciesPhoto` en `species.api.ts` |
| Usa otra ruta para quitar fotos, o no permite quitarlas | `deleteSpeciesPhoto` en `species.api.ts`. Si no se permite, ocultar el botón de quitar en `species-photos-field.tsx` |
| Permite subir todas las fotos en el `POST` de creación y la app logra enviarlas | `createSpecies` y `src/lib/api/multipart.ts` (aceptar varios archivos); `pendingPhotos` dejaría de hacer falta |
| Cambia el límite de 10 | `SPECIES_PHOTO_LIMIT` (`species-form.schema.ts`) y `SPECIES_MESSAGES.photoLimitReached` |
| `PUT` reemplaza o borra fotos | `updateSpecies` (dejar de usar `toSpeciesFormData` sin archivos o adaptar el orden) |
| Permite reordenar o elegir la principal | Nuevo endpoint en `species.api.ts` y acción en `species-photos-field.tsx` (hoy la principal es la primera) |
| Devuelve otros códigos de error (p. ej. `400` en lugar de `409` al superar el límite) | Nada si trae `mensaje`: la app lo muestra. Si no, `getSpeciesSaveErrorMessage` |
