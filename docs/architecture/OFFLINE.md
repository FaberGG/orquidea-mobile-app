# Modo sin conexión (HE-08)

Guía para usar la base offline creada en SCRUM-63 (HU-21). Decisión técnica: [ADR-0017](../decisions/0017-persistencia-offline.md).
Pensada para quien implemente el mapa offline (SCRUM-68), el mapa base (SCRUM-69) y la cola de reportes
(SCRUM-70).

## 1. Piezas

| Pieza | Dónde | Para qué |
|---|---|---|
| `keyValueStorage`, `getOfflineJson`, `setOfflineJson`, `removeOfflineItem` | `@/lib/offline` | Guardar datos propios del dispositivo (p. ej. una cola de envíos) |
| `PersistQueryClientProvider` + `queryPersistOptions` | `src/providers/app-providers.tsx` | Guarda en el dispositivo las queries marcadas `meta.persist` |
| `OfflineSource` | `@/lib/offline` | Contrato de una feature que quiere datos offline |
| `OFFLINE_SOURCES`, `configureOfflineQueries`, `OfflineSync`, `syncOfflineSources` | `@/features/offline` | Registro y sincronización de las fuentes |
| `downloadOfflineFiles`, `getOfflineFileUri`, `pruneOfflineFiles`, `clearOfflineFiles` | `@/lib/offline` | Archivos (fotos, tiles, GeoJSON) en `Paths.document/offline-files/<carpeta>/` |
| `OfflineImage` (`unavailableFallback`) / `useOfflineFileUri` / `useLocalOfflineFileUri` | `@/components/ui/offline-image`, `@/hooks/use-offline-file-uri` | Mostrar una foto de la API desde disco si ya se descargó; sin conexión (o si falla la carga) mostrar un aviso en su lugar |
| `connectOnlineManager`, `toNetworkStatus` | `@/lib/offline` | TanStack Query pausa las queries sin red confirmada; relee la red al volver a primer plano |
| `connectFocusManager` | `@/lib/query` | Refresca las queries activas vencidas al volver a primer plano (`AppState`) |
| `useNetworkStatus` | `@/hooks/use-network-status` | Estado de la **red** `online` / `offline` / `unknown` en un componente |
| `connectivity` (`getConnectivity`, `reportBackendReachable/Unreachable`) + `useConnectivity` | `@/lib/offline`, `@/hooks/use-connectivity` | Conectividad **efectiva** para la interfaz: sin red **o** backend que no responde = `offline` |
| `watchBackendReachability` | `@/features/offline` | Observa queries y mutaciones: un fallo `network`/`timeout` marca el backend como inalcanzable; una respuesta lo restablece |
| `offline-sync-status` + `useOfflineSyncStatus` / `useOfflineFilesVersion` | `@/lib/offline`, `@/hooks/use-offline-sync-status` | Fase y progreso de la sincronización, última actualización, versión de los archivos en disco; `requestOfflineSync()` |
| `ConnectivityNotice` | `@/features/offline` | Toasts "Sin conexión" / "Conexión restablecida…" / "Contenido actualizado…" |
| `OfflineContentScreen` (`/offline-downloads`) | `@/features/offline` | "Contenido sin conexión" del menú lateral: qué está guardado y "Actualizar ahora" |

Fuentes registradas hoy: `speciesOfflineSource` (copia local de todas las fichas, sincronizada por cambios, con
sus miniaturas y fotos) y `stationsOfflineSource` (estaciones con su foto y miniatura, y las miniaturas de sus
fichas).

## 2. Cómo se comporta una query

- **Con red:** igual que siempre.
- **Sin red confirmada y con copia guardada:** la query devuelve la copia (`data` definido) y el refresco queda
  en pausa. Se reanuda solo al volver la conexión.
- **Sin red confirmada y sin copia:** `isPending && fetchStatus === 'paused'`. La pantalla muestra el CA2 de
  HU-21: *"Esta información no está disponible sin conexión. Conéctate a internet para descargarla."*
- **Error con copia guardada:** mostrar la copia; solo un `404` confirma que el recurso ya no existe.

Patrón de pantalla (ver `species-detail-screen.tsx`):

```tsx
const { data, isPending, isError, error, fetchStatus, refetch } = useAlgo(id);
const removed = isError && isApiError(error) && error.status === 404;
if (data !== undefined && !removed) return <Contenido data={data} />;
if (isPending && fetchStatus === 'paused') return <EmptyState title={X_LABELS.offlineUnavailable} … />;
if (isPending) return <Cargando />;
// … error normal
```

El texto del CA2 se copia en el `constants.ts` de cada feature (`offlineUnavailable`), como el resto de
mensajes de criterios de aceptación.

## 3. Agregar datos offline a una feature (p. ej. el mapa, SCRUM-68)

1. En `features/<feature>/hooks/<algo>-offline.ts`, escribir la función de descarga y la fuente:

   ```ts
   export async function prefetchTrailMapForOffline(queryClient: QueryClient): Promise<string[]> {
     const map = await queryClient.fetchQuery({ queryKey: mapKeys.detail(), queryFn: () => getTrailMap(), staleTime: 0 });
     return map.stations.flatMap((station) => (station.photoUrl ? [station.photoUrl] : []));
   }

   export const trailMapOfflineSource: OfflineSource = {
     name: 'trail-map',
     queryKey: mapKeys.all,
     prefetch: prefetchTrailMapForOffline,
     // folder: 'map-tiles', // si sus archivos van en otra carpeta
   };
   ```

   - Debe **guardar en caché** todo lo que la pantalla vaya a leer, bajo `queryKey` (con `fetchQuery` o
     `setQueryData`). Así queda marcado `meta.persist` automáticamente.
   - Si siembra detalles a partir de un listado, debe **quitar** los que ya no existan
     (`removeQueries` con `predicate`), como `prefetchSpeciesForOffline`.
   - Devuelve las URLs de los archivos que necesita sin red.
2. Exportar la fuente desde el `index.ts` de la feature.
3. Añadirla a `OFFLINE_SOURCES` en `src/features/offline/constants.ts`.
4. En las pantallas, usar `OfflineImage` para fotos de la API y el patrón de la sección 2.
5. Pruebas: simular sin red con `onlineManager.setOnline(false)` y registrar el prefijo con
   `registerOfflineQueries(queryClient, prefijo)` (ver `species-offline.test.tsx`).

**Sincronización por cambios (fichas, HU-21).** Si la API ofrece un endpoint con cursor (como
`GET /api/fichas-taxonomicas/sincronizacion?modificadoDesde=`), guardar los datos y el cursor **en la misma
entrada** de la caché (`SpeciesCatalog` en `speciesKeys.catalog()`): si la copia se pierde, el cursor también, y
la siguiente petición vuelve a ser completa. Aplicar los cambios por `id`, quitar los eliminados, aceptar una
respuesta completa en cualquier momento y, ante un cursor rechazado (`400`), repetir sin cursor. Hacer la
sincronización la `queryFn` de esa clave, para que la pantalla y `OfflineSync` compartan la misma petición, y
devolver las URLs de **toda** la copia (no solo de los cambios) para que `pruneOfflineFiles` no borre fotos
vigentes. Ver `src/features/species/hooks/species-offline.ts`.

Si la fuente necesita un `ETag` (como `/api/mapa`), guardar el último valor dentro de los datos de la query o
con `setOfflineJson` y enviarlo en `If-None-Match`; con `304` devolver los datos guardados.

## 4. Archivos que no son fotos (tiles, GeoJSON — SCRUM-69)

- Descargarlos con `downloadOfflineFiles(urls, { folder: 'map-tiles' })` (o devolverlos desde una fuente con
  `folder: 'map-tiles'`). La extensión de la URL se conserva (`png`, `jpg`, `webp`, `json`, `geojson`, `pbf`).
- Leer la ruta local con `getOfflineFileUri(url, 'map-tiles')`.
- Si se incluyen en la app (assets) no hace falta esta capa. Es el caso del **mapa base offline** (SCRUM-85):
  `assets/maps/popayan-z14.pmtiles`, copiado a `documents/bundled-maps/` por `getOfflineTilesUri()` y leído
  con `useOfflineTiles()` (`pmtiles://file:///…`). El mapa principal cambia solo entre OpenFreeMap y ese
  archivo con `useMapSource()` (SCRUM-84). Ver `src/features/map/README.md`, sección *Mapa sin
  conexión*.

## 5. Cola de envíos pendientes (HU-22, SCRUM-70)

- Guardar la cola con `getOfflineJson` / `setOfflineJson` bajo una clave propia (p. ej.
  `'orquidea.sightings-queue'`). Nunca guardar el token ni datos sensibles: el kv-store no está cifrado.
- Las fotos elegidas se deben **copiar** a una carpeta propia con `expo-file-system` antes de encolar: la URI
  del selector puede desaparecer.
- Para reaccionar a la reconexión usar `useNetworkStatus` (o `onlineManager.subscribe`), como `OfflineSync`.
- Las mutaciones tienen `retry: false` (`src/lib/query`); el reintento lo controla la cola.
- El backend acepta el `id` del cliente (SCRUM-66) para que reenviar no duplique: responde `200` con el
  reporte existente si es del mismo autor y `409` si es de otro. El mismo UUID se usa desde el primer
  envío del formulario, no solo al encolar.
- Implementado en SCRUM-70: ver `src/features/sightings/README.md` (sección *Reportes sin conexión*).
  `storeLocalFile` / `removeLocalFile` de `@/lib/offline` copian y borran la foto.

## 6. Estado visible al usuario (HU-21)

- **Ficha descargada** = texto guardado **y** todas sus fotos (miniatura + fotos del detalle) en disco
  (`getSpeciesOfflineState` en `features/species/utils/species-catalog.ts`). Sin conexión, las fichas
  incompletas se siguen mostrando con la etiqueta *"Fotos no disponibles sin conexión"* y, en el detalle, cada
  foto que falta se reemplaza por un aviso.
- **Descarga en curso:** `syncOfflineSources` publica el progreso (solo cuentan las fotos que faltaban). El
  listado de fichas muestra *"Descargando fichas para usar sin conexión… x/y"*.
- **Avisos generales:** `ConnectivityNotice` (montado en `AppProviders`). No avisa al abrir la app conectada
  ni con estado desconocido; espera `OFFLINE_RECONNECT_SETTLE_MS` con el estado estable.
- Los textos que no vienen de los criterios de aceptación están marcados *"Respaldo local, pendiente de aprobar
  en HU-21"* en los `constants.ts`.

## 7. Detección de conexión

- **Red ≠ backend.** `expo-network` solo dice si hay red. Un fallo `network`/`timeout` (`ApiError.kind`) también
  es "sin conexión" para la interfaz (`watchBackendReachability`, `syncOfflineSources`, la cola de reportes).
  Pero **no** pausa las queries: el `onlineManager` solo lo mueve `expo-network`.
- **No usar `isInternetReachable`:** en Android depende de la comprobación de Google y en una red local sin
  internet daría "sin conexión" aunque el backend responda.
- **Primer plano:** `connectOnlineManager` relee la red, `connectFocusManager` refresca queries y `OfflineSync`
  vuelve a sincronizar si la última sincronización buena tiene más de `OFFLINE_RESYNC_INTERVAL_MS` o el backend
  no respondía.
- **Parpadeos:** `OfflineSync` espera `OFFLINE_RECONNECT_SETTLE_MS` antes de sincronizar al reconectar, cancela
  la corrida en curso (`AbortController`) al perder la red y nunca solapa dos corridas.
- **Estado inicial `unknown`:** no bloquea la interfaz ni muestra avisos.
- **Pruebas:** `onlineManager.setOnline(false)` + simular `expo-network` / `getOfflineFileUri`, como en
  `species-offline.test.tsx`. No reemplazan la prueba en un teléfono real (modo avión, Wi-Fi sin backend,
  red local sin internet).

## 8. Reglas

- Persistir solo datos **públicos** o del propio dispositivo. Lo que depende del rol no se marca `persist`.
- Iniciar o cerrar sesión no borra las queries persistidas (`isSessionDependentQuery` en `features/auth`).
- Abrir la app sin conexión mantiene la sesión iniciada con el último usuario confirmado, mientras el token siga
  vigente; al volver la red se confirma con `GET /yo` (ver [`features/auth`](../../src/features/auth/README.md#sesión)).
  La query de sesión usa `networkMode: 'always'` para no quedar pausada (y la splash visible) sin red.
- Si cambia la forma de un modelo persistido, subir `OFFLINE_CACHE_BUSTER` en
  `src/lib/offline/query-persistence.ts`. Ojo: eso borra toda la copia, y una actualización puede abrirse por
  primera vez sin red. Si el cambio lo permite, es mejor usar una clave nueva y mostrar la anterior hasta la
  primera sincronización (así se migraron las fichas: `LEGACY_SPECIES_LIST_KEY`), o agregar campos que la UI
  trate como opcionales (`thumbnailUrl ?? photoUrl`).
- No llamar a `expo-sqlite` ni a `expo-file-system` directamente para datos offline: usar `@/lib/offline`.
