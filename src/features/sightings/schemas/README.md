# src/features/sightings/schemas/

**Responsabilidad:** validaciones con Zod de los datos externos y del formulario.

| Archivo | Contenido |
|---|---|
| `sighting-dto.schema.ts` | `OccurrenceDto` y `PageResponse<OccurrenceDto>` tal como los envía la API |
| `sighting-form.schema.ts` | Formulario de HU-18: descripción obligatoria (CA2, máx. 2000), clasificación (máx. 150), reino opcional, casilla "No sé qué especie es" (CA3), foto jpg/png ≤ 10 MB y coordenadas en rango |
