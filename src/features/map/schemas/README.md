# src/features/map/schemas/

**Responsabilidad:** validar las respuestas de la API y el formulario de estación.

| Archivo | Contenido |
|---|---|
| `station-dto.schema.ts` | `stationDtoSchema` / `stationListDtoSchema`: forma de `EstacionDto` (contrato inferido) |
| `station-form.schema.ts` | `stationFormSchema`: nombre (≤ 150) y descripción (≤ 2000) obligatorios; latitud y longitud obligatorias y en rango (CA3: 'Las coordenadas ingresadas no son válidas.'); foto jpg/png ≤ 10 MB; ids de fichas. `parseCoordinate` acepta coma o punto decimal |
