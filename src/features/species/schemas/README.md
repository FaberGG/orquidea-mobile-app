# src/features/species/schemas/

**Responsabilidad:** validación del formulario de ficha taxonómica, alineada con `TaxonRequest` del contrato.

| Archivo | Reglas | HU |
|---|---|---|
| `species.schema.ts` | Obligatorios: categoría, orden, familia, género, nombre científico, nombre común, alimentación, rol en el humedal y estado de conservación. Longitudes máximas del contrato: orden/familia/género 100, nombre científico 200, nombre común 150, alimentación y rol 2000. Estado de conservación ∈ UICN (`EX, EW, CR, EN, VU, NT, LC, DD, NE`) | HU-7, HU-8 |
| | Foto: `jpg`/`png`, máximo 10 MB. **Obligatoria al crear, opcional al editar** (variante del esquema por modo) | HU-7, HU-8 |

Mensajes: `Debes completar todos los campos obligatorios.` y `El formato de la imagen no es válido.`
(importados de `../constants.ts`).
