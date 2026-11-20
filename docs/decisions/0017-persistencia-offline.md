# 0017 — Persistencia offline: caché guardada, conectividad global y fotos en disco

**Estado:** Aceptado — 9 de noviembre de 2026. Amplía [0003](0003-estado-de-servidor-tanstack-query.md) y
reemplaza parcialmente a [0015](0015-escaneo-qr-y-conectividad.md) en dos puntos: el gestor de red global de
TanStack Query y la copia guardada de la ficha al escanear sin conexión.

## Contexto

HU-21 pide consultar fichas y mapa sin conexión, y HU-22 crear reportes sin conexión y enviarlos al recuperar
señal. Hasta ahora la caché de TanStack Query vivía solo en memoria, el único almacenamiento era
`expo-secure-store` (token) y las fotos se pedían a R2 en cada visualización. ADR-0015 había dejado
explícitamente fuera la estrategia offline persistente.

## Decisión

1. **Almacenamiento clave-valor:** `expo-sqlite/kv-store` (módulo Expo, incluido en Expo Go, API compatible
   con AsyncStorage). Se expone como `keyValueStorage` y helpers JSON en `src/lib/offline`. En web se usa
   `localStorage` (`offline-storage.web.ts`). No es cifrado: los secretos siguen en SecureStore (ADR-0006).
2. **Caché persistida:** `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister`
   sobre ese almacenamiento (`PersistQueryClientProvider`). **Solo se guardan las queries marcadas
   `meta.persist`** y con datos válidos (`shouldPersistQuery`). Cada feature declara una `OfflineSource` y
   `features/offline` registra sus prefijos con `setQueryDefaults` (`registerOfflineQueries`). Las queries
   persistidas usan `gcTime: Infinity` (un valor finito mayor que ~24,8 días desborda `setTimeout`). La copia
   caduca a los 30 días sin refrescarse (`maxAge`) y se descarta al cambiar `OFFLINE_CACHE_BUSTER`.
3. **Conectividad global:** el `onlineManager` de TanStack Query se conecta a `expo-network` con la misma
   regla de ADR-0015: solo `isConnected === false` con tipo `NONE` es desconexión confirmada; un estado
   desconocido cuenta como en línea. Sin red las queries quedan en pausa (`fetchStatus === 'paused'`) en vez
   de fallar: con copia guardada se muestran los datos y sin ella el mensaje del CA2 de HU-21.
4. **Fotos en disco:** `expo-file-system` (`File.downloadFileAsync`) descarga las fotos a
   `Paths.document/offline-files/<carpeta>/` con un nombre derivado del hash de la URL. `OfflineImage` y
   `useOfflineFileUri` usan el archivo local si existe y la URL remota si no. Tras sincronizar se borran las
   fotos que ya no se usan (solo si todas las fuentes de la carpeta se sincronizaron bien).
5. **Sincronización:** `OfflineSync` (en `AppProviders`) sincroniza las fuentes al abrir la app (tras
   restaurar la caché) y cada vez que la red pasa de `offline` a otro estado.
6. **Sesión:** iniciar, cerrar o cambiar de sesión ya no borra las queries persistidas (datos públicos).
7. **QR sin conexión (cambia ADR-0015):** con desconexión confirmada, si la ficha del QR está guardada se abre
   esa copia; con conexión se mantiene la verificación fresca en la API.

## Consecuencias

- (+) Fichas, estaciones y sus fotos se consultan sin conexión tras una primera apertura con red.
- (+) Una sola base (`src/lib/offline`) para el mapa offline (SCRUM-68) y la cola de reportes (SCRUM-70).
- (+) Pantallas sin cambios de lógica de datos: siguen usando sus hooks de query.
- (−) `expo-sqlite` es un módulo nativo: requiere build nueva fuera de Expo Go.
- (−) Las pantallas deben distinguir `paused` sin datos (sin conexión) de `pending` (cargando).
- (−) La primera sincronización descarga todas las fotos; depende del peso de las imágenes (SCRUM-67).
- (−) Al escanear sin red se puede abrir una ficha guardada que ya se modificó en el servidor.

## Alternativas consideradas

- `@react-native-async-storage/async-storage`: equivalente, pero es un módulo de terceros; el AGENTS del
  proyecto prefiere módulos de Expo.
- Guardar la caché como un archivo JSON con `expo-file-system`: sin dependencia nueva, pero sin API
  clave-valor para la cola de HU-22.
- `Image.prefetch` de `expo-image`: usa la caché de disco de la librería, que el sistema puede vaciar.
- Persistir toda la caché: guardaría datos que dependen del rol (administradores, reportes pendientes).
