# src/features/sightings/types/

**Responsabilidad:** modelos de dominio de los avistamientos. El resto de la app no conoce el JSON de la API.

| Tipo | Descripción |
|---|---|
| `Sighting` | Reporte: descripción, reino, clasificación, lugar, autor, foto, estado y fechas |
| `SightingPage` | Página de reportes (`items`, `page`, `totalPages`) |
| `SightingInput` | Datos para crear un reporte |
| `Kingdom` | `animalia` · `plantae` · `fungi` · `unknown` |
| `SightingStatus` | `pending` · `approved` · `rejected` |
| `Coordinates` | `latitude`, `longitude` |
