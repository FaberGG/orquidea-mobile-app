# src/features/map/ — Mapa del sendero (HE-05)

**Responsabilidad:** mapa interactivo georreferenciado con las estaciones del sendero (pestaña **Mapas**) y la
gestión de esas estaciones.

| HU | Descripción | Rol | Estado |
|---|---|---|---|
| HU-12 | Ver el mapa con las estaciones (y la más cercana con geolocalización) | Todos | ✅ Consumo público de `GET /api/mapa` |
| HU-13 | Crear, editar y eliminar estaciones; "Ver estación" con sus fichas | Admin+ (gestión) · Todos (consulta) | ✅ Integrado con el contrato de `dev` |

## Flujo de estaciones de HU-13

La pestaña **Mapas** es la entrada principal de HU-12 y permite abrir una estación desde el recorrido. El menú
lateral conserva **Estaciones del sendero** (`/stations`, todos los roles) como vista alternativa y como entrada
administrativa:

```
Menú lateral → /stations (listado) → /stations/:id ("Ver estación") → Editar (/stations/:id/edit) · ELIMINAR
                └─ + (stations:manage) → /stations/new
```

Desde el mapa o desde el listado, tocar una estación abre `/stations/:id`. El listado se mantiene para facilitar
la consulta directa y la gestión de estaciones.

| Carpeta | Contenido |
|---|---|
| `api/map.api.ts` | Consulta pública de `GET /api/mapa` |
| `api/map.mappers.ts` | Valida y transforma el DTO, convierte GeoJSON `[longitud, latitud]` y calcula estación más cercana |
| `hooks/use-trail-map.ts` | Query del recorrido con caché y cancelación de petición |
| `schemas/map.schema.ts` | Valida la respuesta completa de backend |
| `types/` | Modelo de recorrido, estaciones y fichas asociadas |
| `components/map-screen.tsx` | Estados de carga/error/vacío, ubicación actual y coordinación de la pantalla |
| `components/trail-map-view.tsx` | Mapa MapLibre: mapa base de OpenFreeMap, tramos, estaciones y ubicación; su ref expone la cámara |
| `components/map-layers.tsx` | Piezas compartidas del mapa: `TrailSegmentsLayer` (tramos GeoJSON), `MapPin` y `MapAttribution` |
| `components/map-location-picker.tsx` | SCRUM-72: `MapLocationPicker`, selector de un punto en pantalla completa (tocar el mapa o arrastrar el marcador, CONFIRMAR). Muestra el sendero como referencia. Lo usan estaciones (HU-13) y avistamientos (HU-18, vía `@/features/map`); solo se ofrece con conexión |
| `components/map-controls.tsx` | **Gestionar mapa** (con permiso), centrar en la ubicación y estación más cercana |
| `components/station-details-card.tsx` | Muestra detalles y abre fichas asociadas |
| `api/`, `hooks/`, `schemas/`, `components/` de estaciones | CRUD de estaciones para HU-13, formularios, validación y pantallas administrativas |
| `constants.ts` | Textos, claves de caché y mensajes de HU-12 |
| `utils/map-camera.ts` | Vista inicial del recorrido (bounds + margen), vista de ubicación y conversión `[longitud, latitud]` |
| `index.ts` | Exporta la API pública de la feature |

El mapa usa **MapLibre** (`@maplibre/maplibre-react-native` 11.5.1), el mismo motor en Android e iOS y sin API
keys ([ADR-0018](../../../docs/decisions/0018-mapa-con-maplibre-y-openfreemap.md)). Con conexión, el mapa base es
el estilo Liberty de **OpenFreeMap** (`MAP_STYLE_URL`). La atribución "© OpenStreetMap contributors · ©
OpenMapTiles" se muestra siempre sobre el mapa (`MapAttribution`). No hay vista satelital. MapLibre necesita un
development build: el mapa no funciona en Expo Go. En Jest se usa `jest/maplibre-react-native-mock.js`.

El backend ya integró HU-12 y HU-13 en `dev`. `GET /api/mapa` es público; mientras no se cargue el
recorrido GPX, `tramos` puede venir vacío y el mapa sigue mostrando las estaciones disponibles.

**Permiso:** `stations:manage` (admin y superadmin) para **+**, **Editar estación** y **ELIMINAR**. Las rutas de
crear y editar viven en `src/app/(admin)/stations/`.

## Recorrido de solo lectura

El recorrido (tramos y estaciones) lo define y administra el backend: la app solo lo lee con `GET /api/mapa` y
no ofrece ninguna forma de trazarlo, guardarlo ni exportarlo. Con `stations:manage`, **Gestionar mapa** solo
ofrece **Crear estación** (HU-13).

## Mapa sin conexión (pendiente)

La descarga manual de recorridos (`/offline-downloads`, esquema SVG del sendero) se retiró en HU-21: esa ruta es
ahora **Contenido sin conexión** (`features/offline`). El mapa base sin conexión llegará como un PMTiles de
Popayán (esquema OpenMapTiles, ~1,3 MB) **incluido en la app**, sin descargas ni servidor propio: la app usará
OpenFreeMap con conexión y ese archivo sin ella, con el mismo estilo. Hoy, sin conexión, el mapa base no carga;
el recorrido y las estaciones sí, desde la caché offline.

**Modo sin conexión (HU-21):** `stationsOfflineSource` (en `index.ts`) guarda las estaciones, su foto y miniatura
y las miniaturas de sus fichas (las fotos completas de las fichas las guarda `speciesOfflineSource`); las pantallas de estaciones muestran la copia guardada o el mensaje del CA2.
`useStationsOfflineCount` (en `index.ts`) da el número de estaciones guardadas a la pantalla "Contenido sin
conexión". El mapa offline se agregará como otra fuente según
[docs/architecture/OFFLINE.md](../../../docs/architecture/OFFLINE.md).

**Dependencias:** usa `useSpeciesList` del barrel de `@/features/species` para el selector de fichas, y
`getCurrentLocation` de `@/lib/location` para "Usar mi ubicación actual".
