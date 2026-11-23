# src/features/map/components/

**Responsabilidad:** pantallas y piezas de HE-05. Sin diseño en Figma (HU-12 y HU-13 están "pendiente de
diseño"): usan los tokens y la estructura de fichas y componentes del humedal.

## Pantallas

| Componente | Ruta | Descripción |
|---|---|---|
| `MapScreen` | `/map` (pestaña) | Recorrido publicado, estaciones, ubicación y trazado local con permiso administrativo |
| `StationsListScreen` | `/stations` | Listado público; **+** con `stations:manage` |
| `StationDetailScreen` | `/stations/:id` | "Ver estación": foto, descripción, ubicación (abre la app de mapas) y enlaces a sus fichas (CA4). Editar y ELIMINAR con `stations:manage` |
| `StationCreateScreen` | `/stations/new` | GUARDAR ESTACIÓN (CA1, CA4); al guardar abre el detalle |
| `StationEditScreen` | `/stations/:id/edit` | GUARDAR CAMBIOS (CA2): 'La estación se actualizó correctamente.' |

## Piezas

| Archivo | Contenido |
|---|---|
| `station-form.tsx` | Formulario compartido (React Hook Form + Zod): foto, nombre, descripción, latitud/longitud con "Usar mi ubicación actual" y, con conexión, "Elegir en el mapa" (SCRUM-72), y fichas asociadas |
| `map-location-picker.tsx` | SCRUM-72: selector de ubicación en el mapa (marcador movible y CONFIRMAR) |
| `station-species-picker.tsx` | Selector múltiple de fichas (casillas) con `useSpeciesList('all')` |
| `delete-station-dialog.tsx` | Confirmación de ELIMINAR con CONFIRMAR / CANCELAR (CA5) |
| `station-screen-header.tsx` | Encabezado con volver, título y acción opcional |
| `pick-station-photo.ts` | Galería + validación jpg/png ≤ 10 MB |
| `format-station.ts` | Coordenadas con seis decimales y enlace de Google Maps |

Pruebas: `stations-screens.test.tsx` (criterios de HU-13 por rol).

El selector de ubicación y la consulta de estaciones desde el mapa ya están integrados. El trazado conecta en
orden las estaciones tocadas y admite puntos intermedios movibles. Las descargas incluyen geometría, textos y
fotos de estaciones comprimidas en el teléfono; falta el fondo propio georreferenciado del sector.
