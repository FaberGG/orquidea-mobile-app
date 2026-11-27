# src/features/map/components/

**Responsabilidad:** pantallas y piezas de HE-05. Sin diseño en Figma (HU-12 y HU-13 están "pendiente de
diseño"): usan los tokens y la estructura de fichas y componentes del humedal.

## Pantallas

| Componente | Ruta | Descripción |
|---|---|---|
| `MapScreen` | `/map` (pestaña) | Recorrido publicado (solo lectura), estaciones, ubicación y **Crear estación** con `stations:manage` |
| `StationsListScreen` | `/stations` | Listado público; **+** con `stations:manage` |
| `StationDetailScreen` | `/stations/:id` | "Ver estación": foto, descripción, ubicación (abre la app de mapas) y enlaces a sus fichas (CA4). Editar y ELIMINAR con `stations:manage` |
| `StationCreateScreen` | `/stations/new` | GUARDAR ESTACIÓN (CA1, CA4); al guardar abre el detalle |
| `StationEditScreen` | `/stations/:id/edit` | GUARDAR CAMBIOS (CA2): 'La estación se actualizó correctamente.' |

## Piezas

| Archivo | Contenido |
|---|---|
| `station-form.tsx` | Formulario compartido (React Hook Form + Zod): foto, nombre, descripción, latitud/longitud con "Usar mi ubicación actual" y, con conexión, "Elegir en el mapa" (SCRUM-72), y fichas asociadas |
| `map-location-picker.tsx` | SCRUM-72: selector de ubicación en el mapa (marcador movible y CONFIRMAR) |
| `trail-map-view.tsx` | Mapa MapLibre del recorrido. Capas de abajo arriba: mapa base (OpenFreeMap o PMTiles offline según `source`, SCRUM-84), ilustración del humedal, tramos, estaciones y ubicación |
| `map-layers.tsx` | Tramos como capa GeoJSON, ilustración del humedal (`WetlandIllustrationLayer`, desde zoom 15), pin de estación y atribución de OpenStreetMap/OpenMapTiles |
| `station-species-picker.tsx` | Selector múltiple de fichas (casillas) con `useSpeciesList('all')` |
| `delete-station-dialog.tsx` | Confirmación de ELIMINAR con CONFIRMAR / CANCELAR (CA5) |
| `station-screen-header.tsx` | Encabezado con volver, título y acción opcional |
| `pick-station-photo.ts` | Galería + validación jpg/png ≤ 10 MB |
| `format-station.ts` | Coordenadas con seis decimales y enlace de Google Maps |

Pruebas: `stations-screens.test.tsx` (criterios de HU-13 por rol).

El selector de ubicación y la consulta de estaciones desde el mapa ya están integrados. El recorrido es de solo
lectura: lo administra el backend y la app no permite trazarlo ni exportarlo.
