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
| `components/trail-map-view.tsx` | Dibuja la geometría y las estaciones en el mapa nativo |
| `components/map-location-picker.tsx` | SCRUM-72: `MapLocationPicker`, selector de un punto en pantalla completa (tocar el mapa o arrastrar el marcador, CONFIRMAR). Muestra el sendero como referencia. Lo usan estaciones (HU-13) y avistamientos (HU-18, vía `@/features/map`); solo se ofrece con conexión |
| `components/map-controls.tsx` | Cambia la capa del mapa y permite centrar en la ubicación |
| `components/station-details-card.tsx` | Muestra detalles y abre fichas asociadas |
| `api/`, `hooks/`, `schemas/`, `components/` de estaciones | CRUD de estaciones para HU-13, formularios, validación y pantallas administrativas |
| `constants.ts` | Textos, claves de caché y mensajes de HU-12 |
| `utils/map-region.ts` | Calcula la vista inicial del recorrido y el encuadre de ubicación |
| `index.ts` | Exporta la API pública de la feature |

La vista nativa usa `react-native-maps` 1.27.2, instalado con `npx expo install` para respetar Expo SDK 57.
El mapa estándar y satelital se apoyan en Apple Maps en iOS y Google Maps en Android; ambos se pueden
abrir en Expo Go para pruebas.

El backend ya integró HU-12 y HU-13 en `dev`. `GET /api/mapa` es público; mientras no se cargue el
recorrido GPX, `tramos` puede venir vacío y el mapa sigue mostrando las estaciones disponibles.

**Permiso:** `stations:manage` (admin y superadmin) para **+**, **Editar estación** y **ELIMINAR**. Las rutas de
crear y editar viven en `src/app/(admin)/stations/`.

**Modo sin conexión (HU-21):** `stationsOfflineSource` (en `index.ts`) guarda las estaciones y las fotos de
las estaciones y de sus fichas; las pantallas de estaciones muestran la copia guardada o el mensaje del CA2.
El recorrido (`/api/mapa`) se agregará como otra fuente en SCRUM-68 siguiendo
[docs/architecture/OFFLINE.md](../../../docs/architecture/OFFLINE.md).

**Dependencias:** usa `useSpeciesList` del barrel de `@/features/species` para el selector de fichas, y
`getCurrentLocation` de `@/lib/location` para "Usar mi ubicación actual".
