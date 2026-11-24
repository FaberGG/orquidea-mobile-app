# 0018 — Mapa con MapLibre y OpenFreeMap (sin Google Maps)

**Estado:** Aceptado — 23 de noviembre de 2026. Primera parte del plan del mapa offline (opción B): mapa en
línea con OpenFreeMap. El mapa sin conexión (PMTiles de Popayán incluido en la app) llega en tareas
posteriores sobre esta misma base.

## Contexto

`react-native-maps` no es un proveedor de mapas: en Android solo usa el SDK de Google Maps, que exige una API
key en el `AndroidManifest.xml`. El proyecto no tiene ninguna: en Expo Go funcionaba con la key propia de Expo,
pero en los builds propios la pestaña **Mapas** cerraba la app con una excepción nativa (`API key not found`)
que no se puede atrapar desde JavaScript. Google Maps se descarta por coste y por depender de una cuenta de
facturación. Además, el mapa debe poder funcionar sin conexión con mosaicos propios, cosa que
`react-native-maps` no resuelve.

## Decisión

1. **Motor:** `@maplibre/maplibre-react-native` **11.5.1** (MapLibre Native: Android 13.6.1, iOS 6.31). Mismo
   motor en Android e iOS, sin API keys. Solo nueva arquitectura (Expo SDK 58 ya la usa). Se configura con su
   config plugin (`app.json` → `plugins`) y necesita un development build; no funciona en Expo Go.
2. **Mapa base con conexión:** estilo **Liberty** de OpenFreeMap
   (`https://tiles.openfreemap.org/styles/liberty`, `MAP_STYLE_URL` en `src/features/map/constants.ts`).
   Esquema OpenMapTiles, el mismo que usarán los PMTiles propios sin conexión. Es temporal hasta el estilo
   propio del proyecto.
3. **Atribución:** texto fijo y visible sobre el mapa (`MapAttribution`):
   "© OpenStreetMap contributors · © OpenMapTiles". El control nativo de MapLibre se oculta para no
   duplicarlo.
4. **Sin vista satelital:** OpenFreeMap no ofrece imagen satelital y las fuentes gratuitas (Esri, Google)
   tienen términos restrictivos. Se retira el botón "Vista satelital".
5. **Recorrido y estaciones:** tramos como `GeoJSONSource` + `Layer` de línea; estaciones como `Marker` (vista
   React Native accesible y pulsable); punto del selector como `ViewAnnotation` arrastrable. Las coordenadas
   pasan por `toLngLat` / `fromLngLat` (`src/features/map/utils/map-camera.ts`): MapLibre usa
   `[longitud, latitud]`.
6. **Trazado manual retirado (SCRUM-79):** el recorrido es de solo lectura y lo administra el backend.

## Condiciones de uso de OpenFreeMap (revisadas el 23 de noviembre de 2026)

Fuentes: <https://openfreemap.org/>, <https://openfreemap.org/tos/> (14 oct 2026),
<https://openfreemap.org/privacy/> (8 oct 2026).

- **Uso comercial y en producción:** permitido ("Is commercial usage allowed? Yes."). Sin registro, sin API
  keys, sin cookies y, según el operador, sin límite de vistas ni de peticiones.
- **Sin SLA:** servicio "as-is" y "as available"; el operador puede discontinuarlo sin aviso. Se financia con
  donaciones. **Consecuencia:** el mapa offline incluido en la app (tareas siguientes) actúa también como
  respaldo si OpenFreeMap no responde; si el servicio desapareciera, la alternativa es autoalojar sus
  mosaicos (publican descargas semanales del planeta) o un PMTiles propio más grande.
- **Atribución obligatoria:** OpenMapTiles y OpenStreetMap; mencionar OpenFreeMap es opcional.
- **Descargas offline desde su servidor:** como máximo 3.000 mosaicos o 50 MB por descarga, 4 peticiones en
  paralelo y un User-Agent propio de la app. Prohibida la recolección automatizada fuera de eso. **No aplica a
  este proyecto:** el mapa offline se genera con Planetiler a partir de OpenStreetMap y no se descarga de
  OpenFreeMap.
- **Privacidad:** registros de acceso anonimizados sin IP; los registros de errores guardan IP 7 días.
  Puede usar Cloudflare como CDN. La app no envía identificadores del usuario en las peticiones de mosaicos.

## Spike de compatibilidad

Verificado en este cambio:

- Compila con Expo SDK 58 / React Native 0.88 (`npx expo prebuild` + `assembleDebug`).
- Tipos y API v11 confirmados contra el paquete instalado (`Map`, `Camera`, `GeoJSONSource`, `Layer`,
  `Marker`, `ViewAnnotation`, `UserLocation`, `ImageSource`, `VectorSource`).

Pendiente de probar en un dispositivo (bloquea las tareas del mapa offline):

- [ ] El mapa abre con OpenFreeMap, sendero, estaciones y ubicación en Android (dev build) e iOS (EAS/Mac).
- [ ] **PMTiles local:** `VectorSource` con `url="pmtiles://file://…"` apuntando a `popayan-z14.pmtiles`.
      Plan B si no funciona: convertir a MBTiles (`pmtiles convert`) y usar `mbtiles://`.
- [ ] `ImageSource` con un PNG local (`require`) colocado por sus 4 esquinas.
- [ ] Cambiar la URL de una fuente en caliente sin desmontar el mapa ni mover la cámara.
- [ ] `ViewAnnotation.onDragEnd` entrega `nativeEvent.lngLat`; `onDidFailLoadingMap` se dispara sin red.
- [ ] APK release sin las reglas ProGuard de Room/WorkManager (solo las traía `react-native-maps`).

## Consecuencias

- Android vuelve a tener mapa en builds propios; desaparece la dependencia de Google y de API keys.
- El mapa necesita un development build (`npx expo run:android|ios` o EAS); Expo Go ya no sirve para probarlo.
- En Jest, `@maplibre/maplibre-react-native` se sustituye por `jest/maplibre-react-native-mock.js`.
- Sin conexión, mientras no llegue el PMTiles incluido, el mapa base no carga (el recorrido y las estaciones
  sí, desde la caché offline de HU-21).

## Alternativas descartadas

- **Google Maps con API key:** coste en producción y dependencia de una cuenta de facturación.
- **Mantener `react-native-maps` solo en iOS (Apple Maps):** dos motores distintos y sin solución offline.
- **Mosaicos de Protomaps:** otro esquema; obligaría a mantener dos estilos (en línea y offline).
- **Paquetes offline de MapLibre contra OpenFreeMap:** muchas descargas de Popayán desde un servicio gratuito
  serían tráfico masivo (y superan sus límites de descarga offline).
