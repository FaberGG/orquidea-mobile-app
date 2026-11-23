# src/features/map/ — Mapa del sendero (HE-05)

**Responsabilidad:** mapa interactivo georreferenciado con las estaciones del sendero (pestaña **Mapas**) y la
gestión de esas estaciones.

| HU | Descripción | Rol | Estado |
|---|---|---|---|
| HU-12 | Ver el mapa con las estaciones (y la más cercana con geolocalización) | Todos | ✅ Consumo público de `GET /api/mapa` |
| HU-13 | Crear, editar y eliminar estaciones; "Ver estación" con sus fichas | Admin+ (gestión) · Todos (consulta) | ✅ Integrado con el contrato de `dev` |
| Trazado GPX local | Dibujar un recorrido tocando mapa/estaciones y compartirlo como GPX | Admin+ | ✅ Exportación local; publicación desde la app requiere endpoint de Back |

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
| `components/trail-drawing-panel.tsx` | Captura el nombre, los puntos y las acciones para exportar un GPX |
| `utils/trail-gpx.ts` | Convierte puntos del mapa en un archivo GPX 1.1 |
| `components/station-details-card.tsx` | Muestra detalles y abre fichas asociadas |
| `api/`, `hooks/`, `schemas/`, `components/` de estaciones | CRUD de estaciones para HU-13, formularios, validación y pantallas administrativas |
| `constants.ts` | Textos, claves de caché y mensajes de HU-12 |
| `utils/map-region.ts` | Calcula la vista inicial del recorrido y el encuadre de ubicación |
| `index.ts` | Exporta la API pública de la feature |

La vista nativa usa `react-native-maps` 1.29.11, instalado con `npx expo install` para respetar Expo SDK 58.
El mapa estándar y satelital se apoyan en Apple Maps en iOS y Google Maps en Android; ambos se pueden
abrir en Expo Go para pruebas.

El backend ya integró HU-12 y HU-13 en `dev`. `GET /api/mapa` es público; mientras no se cargue el
recorrido GPX, `tramos` puede venir vacío y el mapa sigue mostrando las estaciones disponibles.

**Permiso:** `stations:manage` (admin y superadmin) para **+**, **Editar estación** y **ELIMINAR**. Las rutas de
crear y editar viven en `src/app/(admin)/stations/`.

## Trazado de un recorrido

Con `stations:manage`, el mapa muestra **Gestionar mapa** con dos acciones: **Crear estación**, que abre el
formulario de HU-13, y **Trazar sendero**. Toca las estaciones en orden para añadir paradas conectadas; los
marcadores muestran su número y no se puede añadir la misma estación dos veces. Toca el mapa para agregar
puntos intermedios y arrástralos para ajustar el camino. El panel permite deshacer el último punto, limpiar el
trazado, cancelar o exportar un GPX cuando hay al menos dos puntos. **Guardar en mapa** conserva el trazado en
el almacenamiento privado del dispositivo y lo restaura al volver a abrir la app; **Exportar GPX** genera un
archivo separado y abre la hoja de compartir. El backend actual solo ofrece `GET /api/mapa`, por lo que la app
no puede publicar la ruta para los demás visitantes; para eso se necesita un endpoint protegido de escritura en
Back.

## Descargas sin conexión

La descarga manual de recorridos (`/offline-downloads`, esquema SVG del sendero) se retiró en HU-21: esa ruta es
ahora **Contenido sin conexión** (`features/offline`). El mapa sin conexión llegará con la migración a MapLibre
(SCRUM-68/69), con su propio mecanismo de descarga.

## Mejoras del trazado y descargas

El requisito acordado es evitar suscripciones obligatorias o cobros por uso para las funciones de senderos.
Esto permite bibliotecas de código abierto y datos propios; no exige eliminar toda herramienta externa.
No debe dependerse de que el nivel gratuito de un proveedor comercial permanezca disponible.

- El trazado ya conecta estaciones según el orden elegido, admite puntos intermedios movibles y se puede copiar
  a una descarga local. Los borradores continúan siendo privados del dispositivo; el servidor no ofrece escritura.
- Los paquetes ya incluyen geometría, estaciones y fotos reducidas de estaciones. Falta añadir una imagen
  georreferenciada del sector con permiso de almacenamiento y redistribución. El visor no debe pedir mosaicos a
  un proveedor comercial.
- Para mostrar ruta y GPS sobre esa imagen se deben verificar sus coordenadas y proyección. Una fotografía o
  captura sin referencia geográfica no permite situar correctamente al visitante.
- Permitir reconocer las estaciones por sus fotos cuando no se obtenga la ubicación, y abrir el paquete aunque
  fallen los mapas en línea. No se debe anunciar una descarga con imágenes si falta algún archivo requerido.

Falta obtener la imagen del sector y sus derechos de reutilización. El editor aún no publica recorridos para los
demás usuarios; el backend necesita un contrato de escritura para eso. Los mapas en línea actuales siguen usando
Apple/Google; pueden conservarse como una capa opcional, mientras que la descarga propia funciona sin esa capa.
El alojamiento de la API y la distribución de la app siguen siendo servicios distintos que pueden tener costes.

**Modo sin conexión (HU-21):** `stationsOfflineSource` (en `index.ts`) guarda las estaciones, su foto y miniatura
y las miniaturas de sus fichas (las fotos completas de las fichas las guarda `speciesOfflineSource`); las pantallas de estaciones muestran la copia guardada o el mensaje del CA2.
`useStationsOfflineCount` (en `index.ts`) da el número de estaciones guardadas a la pantalla "Contenido sin
conexión". El mapa offline se agregará como otra fuente según
[docs/architecture/OFFLINE.md](../../../docs/architecture/OFFLINE.md).

**Dependencias:** usa `useSpeciesList` del barrel de `@/features/species` para el selector de fichas, y
`getCurrentLocation` de `@/lib/location` para "Usar mi ubicación actual".
