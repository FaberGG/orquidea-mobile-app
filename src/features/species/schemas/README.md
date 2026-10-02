# src/features/species/schemas/

**Responsabilidad:** validación del formulario de ficha taxonómica.

| Archivo | Reglas | HU |
|---|---|---|
| `species.schema.ts` | Campos obligatorios: categoría, orden, familia, género, nombre científico, nombre común, alimentación, rol en el humedal, estado de conservación y foto. Foto solo `jpg`/`png` | HU-7, HU-8 |

Mensajes: `Debes completar todos los campos obligatorios.` y `El formato de la imagen no es válido.`
(importados de `../constants.ts`).
