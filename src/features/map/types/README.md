# src/features/map/types/

**Responsabilidad:** modelos de dominio de las estaciones del sendero. El resto de la app no conoce el JSON de la API.

| Tipo | Descripción |
|---|---|
| `Station` | Estación: nombre, descripción, foto, `location` (`Coordinates` de `@/lib/location`) y fichas asociadas |
| `StationSpecies` | Resumen de una ficha asociada: `id`, `vernacularName`, `photoUrl` |
| `StationInput` | Datos para crear o editar: texto, ubicación, `speciesIds` y foto nueva (opcional al editar) |
| `StationPhoto` | Foto elegida en el dispositivo (jpg o png) |
