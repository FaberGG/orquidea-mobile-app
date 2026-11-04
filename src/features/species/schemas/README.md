# src/features/species/schemas/

**Responsabilidad:** validar las respuestas de la API antes de mapearlas (CODIGO §2).

| Archivo | Contenido |
|---|---|
| `species-dto.schema.ts` | `taxonDtoSchema` y `taxonListDtoSchema`: forma de `TaxonDto`; `estadoConservacion` acepta solo los nueve códigos de la API |

`species-form.schema.ts`: formulario de HU-7 y HU-8. Fotos nuevas (`newPhotos`, máximo `SPECIES_PHOTO_LIMIT` = 10, jpg/png ≤ 10 MB) y fotos guardadas que se quitan (`removedPhotoIds`).
