# src/lib/offline/ — Infraestructura offline (HE-08)

**Responsabilidad:** guardar datos y archivos en el dispositivo y conectar la conectividad con TanStack Query,
sin conocer el dominio. Decisión: [ADR-0017](../../../docs/decisions/0017-persistencia-offline.md). Guía de
uso para nuevas features: [docs/architecture/OFFLINE.md](../../../docs/architecture/OFFLINE.md).

## Contenido

| Archivo | Contenido |
|---|---|
| `offline-storage.ts` / `.web.ts` | `keyValueStorage` (`expo-sqlite/kv-store`; `localStorage` en web) y helpers `getOfflineJson`, `setOfflineJson`, `removeOfflineItem`. No cifrado |
| `key-value-storage.types.ts` | Tipo `KeyValueStorage` (compatible con AsyncStorage) |
| `query-persistence.ts` | `queryPersister`, `queryPersistOptions`, `offlineQueryOptions` (`meta.persist`, `gcTime: Infinity`), `registerOfflineQueries`, `shouldPersistQuery`, `isPersistedQuery`, `OFFLINE_CACHE_MAX_AGE_MS`, `OFFLINE_CACHE_BUSTER` |
| `offline-source.ts` | Tipo `OfflineSource`: lo que exporta una feature para tener datos offline |
| `offline-files.ts` | `downloadOfflineFiles`, `getOfflineFileUri`, `pruneOfflineFiles`, `clearOfflineFiles`, `offlineFileName` (archivos en `Paths.document/offline-files/<carpeta>/`); `storeLocalFile` / `removeLocalFile` para copiar y borrar archivos propios del dispositivo (fotos de la cola de reportes, SCRUM-70) |
| `network-state.ts` | `toNetworkStatus`: regla de conectividad de ADR-0015 |
| `online-manager.ts` | `connectOnlineManager`: TanStack Query pausa las queries sin red confirmada |
| `index.ts` | API pública |
| `__tests__/` | Pruebas (el kv-store se sustituye por `jest/kv-store-mock.js`) |

## Reglas

- No importa features ni textos de UI.
- Solo datos públicos o del propio dispositivo: los secretos van en `@/lib/storage` (SecureStore).
- `gcTime` de las queries persistidas es `Infinity`: un valor finito mayor que ~24,8 días desborda
  `setTimeout` y TanStack Query borraría la entrada al instante.
- Cambiar `OFFLINE_CACHE_BUSTER` cuando un modelo persistido cambie de forma incompatible.
