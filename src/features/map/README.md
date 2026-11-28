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
| `components/trail-map-view.tsx` | Mapa MapLibre: mapa base (OpenFreeMap o PMTiles offline, SCRUM-84), ilustración del humedal, tramos, estaciones y ubicación; su ref expone la cámara |
| `components/map-layers.tsx` | Piezas compartidas del mapa: `TrailSegmentsLayer` (tramos GeoJSON), `WetlandIllustrationLayer` (SCRUM-84), `MapPin` y `MapAttribution` |
| `hooks/use-map-source.ts` | SCRUM-84: elige el mapa base según la conexión (OpenFreeMap / PMTiles), con asentamiento, respaldo si OpenFreeMap falla o tarda y los avisos "Usar mapa offline" / "Usando mapa con conexión" |
| `components/map-location-picker.tsx` | SCRUM-72: `MapLocationPicker`, selector de un punto en pantalla completa (tocar el mapa o arrastrar el marcador, CONFIRMAR). Muestra el sendero como referencia. Lo usan estaciones (HU-13) y avistamientos (HU-18, vía `@/features/map`). SCRUM-85: también sin conexión, con el PMTiles de Popayán; fuera de esa área avisa y ofrece el GPS |
| `components/map-controls.tsx` | **Gestionar mapa** (con permiso), centrar en la ubicación y estación más cercana |
| `components/station-details-card.tsx` | Muestra detalles y abre fichas asociadas |
| `api/`, `hooks/`, `schemas/`, `components/` de estaciones | CRUD de estaciones para HU-13, formularios, validación y pantallas administrativas |
| `constants.ts` | Textos, claves de caché y mensajes de HU-12 |
| `utils/map-camera.ts` | Vista inicial del recorrido (bounds + margen), vista de ubicación y conversión `[longitud, latitud]` |
| `utils/offline-tiles.ts` | SCRUM-85: copia el PMTiles empaquetado a documentos (`getOfflineTilesUri`), `toPmtilesUrl` e `isInsideOfflineArea` (`OFFLINE_MAP_BOUNDS`) |
| `utils/offline-map-style.ts` | SCRUM-85: estilo **provisional** sin conexión (agua, vegetación, edificios y vías, sin etiquetas) hasta el estilo propio con glyphs y sprites (SCRUM-82) |
| `hooks/use-offline-tiles.ts` | SCRUM-85: URL `pmtiles://` lista para MapLibre |
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

## Mapa sin conexión

La descarga manual de recorridos (`/offline-downloads`, esquema SVG del sendero) se retiró en HU-21: esa ruta es
ahora **Contenido sin conexión** (`features/offline`). El mapa base sin conexión es un PMTiles de Popayán
(esquema OpenMapTiles, ~1,3 MB) **incluido en la app**, sin descargas ni servidor propio: la app usa
OpenFreeMap con conexión y ese archivo sin ella.

**SCRUM-85 (hecho):**

- El archivo vive en `assets/maps/popayan-z14.pmtiles` (se genera con `npm run maps:build`, ver
  `scripts/maps/README.md`). `metro.config.js` registra la extensión `.pmtiles` y `src/types/pmtiles.d.ts`
  permite importarlo.
- `getOfflineTilesUri()` lo resuelve con `expo-asset` y lo copia una vez a
  `documents/bundled-maps/popayan-z14-<hash>.pmtiles` (de nuevo solo si cambia el archivo en una versión de la
  app; las copias viejas se borran). Esa carpeta queda fuera de `offline-files/`, así que borrar el contenido
  offline no la toca. En un build release el asset viaja dentro de la app: funciona desde la instalación y en
  modo avión, sin descargar nada.
- `useOfflineTiles()` entrega `pmtiles://file:///…` para la fuente vectorial `openmaptiles`.
- El **selector de ubicación** ya no exige conexión: sin red usa ese archivo con el estilo provisional
  (`createOfflineMapStyle`), muestra el aviso de que el mapa cubre Popayán y ofrece **USAR MI UBICACIÓN (GPS)**.
  Si el punto queda fuera de `OFFLINE_MAP_BOUNDS`, lo avisa. Con estado de red desconocido se comporta como con
  conexión.

**SCRUM-84 (hecho):**

- `useMapSource()` elige el mapa base del mapa principal: OpenFreeMap con conexión; el PMTiles sin conexión,
  o si OpenFreeMap falla (`onDidFailLoadingMap`) o no carga en `ONLINE_MAP_TIMEOUT_MS` (8 s). Los cambios de
  red esperan `MAP_SOURCE_SETTLE_MS` (igual a `OFFLINE_RECONNECT_SETTLE_MS`) para que una red que parpadea no
  haga saltar el mapa; al volver la red se reintenta OpenFreeMap.
- Avisos con el toast, una vez por cambio: **"Usar mapa offline"** y **"Usando mapa con conexión"** (este
  último cuando OpenFreeMap vuelve a cargar). El cambio es automático, sin botón. Si no hay red y la
  ubicación del visitante queda fuera de Popayán, el mapa lo avisa.
- Capas, de abajo arriba: mapa base, ilustración del humedal (`assets/maps/humedal-ilustracion.png`,
  SCRUM-83, desde zoom 15, esquinas en `WETLAND_ILLUSTRATION`), sendero y estaciones. La ilustración es un
  asset: se ve igual con y sin conexión.
- Hoy cambia el estilo completo (el de OpenFreeMap por URL o el provisional offline); ningún estilo trae
  `center` ni `zoom`, así que la cámara no se mueve. Con el estilo propio empaquetado (SCRUM-82) solo
  cambiará la URL de la fuente `openmaptiles`.

**Pendiente:** el estilo propio con etiquetas e íconos (SCRUM-82) y validar en QGIS la ubicación de la
ilustración: sus esquinas (centro ≈ 2.4572, −76.6317) quedan ~2 km al oeste de `WETLAND_CENTER`
(2.4598, −76.6115); hay que confirmar cuál es la ubicación real con el recorrido de `/api/mapa`. Falta probar en dispositivo que MapLibre abre `pmtiles://file://…` (spike de
[ADR-0018](../../../docs/decisions/0018-mapa-con-maplibre-y-openfreemap.md)); plan B: `mbtiles://`.

**Modo sin conexión (HU-21):** `stationsOfflineSource` (en `index.ts`) guarda las estaciones, su foto y miniatura
y las miniaturas de sus fichas (las fotos completas de las fichas las guarda `speciesOfflineSource`); las pantallas de estaciones muestran la copia guardada o el mensaje del CA2.
`useStationsOfflineCount` (en `index.ts`) da el número de estaciones guardadas a la pantalla "Contenido sin
conexión". El mapa offline se agregará como otra fuente según
[docs/architecture/OFFLINE.md](../../../docs/architecture/OFFLINE.md).

**Dependencias:** usa `useSpeciesList` del barrel de `@/features/species` para el selector de fichas, y
`getCurrentLocation` de `@/lib/location` para "Usar mi ubicación actual".
