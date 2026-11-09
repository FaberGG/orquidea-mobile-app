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
| `OfflineImage` / `useOfflineFileUri` | `@/components/ui/offline-image`, `@/hooks/use-offline-file-uri` | Mostrar una foto de la API desde disco si ya se descargó |
| `connectOnlineManager`, `toNetworkStatus` | `@/lib/offline` | TanStack Query pausa las queries sin red confirmada |
| `useNetworkStatus` | `@/hooks/use-network-status` | Estado `online` / `offline` / `unknown` en un componente |

Fuentes registradas hoy: `speciesOfflineSource` (fichas y sus fotos) y `stationsOfflineSource` (estaciones y
fotos de estaciones y de sus fichas).

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

Si la fuente necesita un `ETag` (como `/api/mapa`), guardar el último valor dentro de los datos de la query o
con `setOfflineJson` y enviarlo en `If-None-Match`; con `304` devolver los datos guardados.

## 4. Archivos que no son fotos (tiles, GeoJSON — SCRUM-69)

- Descargarlos con `downloadOfflineFiles(urls, { folder: 'map-tiles' })` (o devolverlos desde una fuente con
  `folder: 'map-tiles'`). La extensión de la URL se conserva (`png`, `jpg`, `webp`, `json`, `geojson`, `pbf`).
- Leer la ruta local con `getOfflineFileUri(url, 'map-tiles')`.
- Si se incluyen en la app (assets) no hace falta esta capa.

## 5. Cola de envíos pendientes (HU-22, SCRUM-70)

- Guardar la cola con `getOfflineJson` / `setOfflineJson` bajo una clave propia (p. ej.
  `'orquidea.sightings-queue'`). Nunca guardar el token ni datos sensibles: el kv-store no está cifrado.
- Las fotos elegidas se deben **copiar** a una carpeta propia con `expo-file-system` antes de encolar: la URI
  del selector puede desaparecer.
- Para reaccionar a la reconexión usar `useNetworkStatus` (o `onlineManager.subscribe`), como `OfflineSync`.
- Las mutaciones tienen `retry: false` (`src/lib/query`); el reintento lo controla la cola.
- El backend acepta el `id` del cliente (SCRUM-66) para que reenviar no duplique.

## 6. Reglas

- Persistir solo datos **públicos** o del propio dispositivo. Lo que depende del rol no se marca `persist`.
- Iniciar o cerrar sesión no borra las queries persistidas (`isSessionDependentQuery` en `features/auth`).
- Si cambia la forma de un modelo persistido, subir `OFFLINE_CACHE_BUSTER` en
  `src/lib/offline/query-persistence.ts`.
- No llamar a `expo-sqlite` ni a `expo-file-system` directamente para datos offline: usar `@/lib/offline`.
