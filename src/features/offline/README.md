# src/features/offline/ — Sincronización offline (HE-08)

**Responsabilidad:** reunir las fuentes de datos offline de las demás features y mantener actualizada la copia
del dispositivo (HU-21). No tiene pantallas. Guía completa: [docs/architecture/OFFLINE.md](../../../docs/architecture/OFFLINE.md).

## Contenido

| Archivo | Contenido |
|---|---|
| `constants.ts` | `OFFLINE_SOURCES`: fuentes registradas (`speciesOfflineSource`, `stationsOfflineSource`) |
| `configure-offline-queries.ts` | `configureOfflineQueries(queryClient)`: marca como persistentes los prefijos de las fuentes |
| `sync-offline-sources.ts` | `syncOfflineSources(queryClient, { sources?, signal? })`: descarga datos, fotos y poda archivos sobrantes |
| `components/offline-sync.tsx` | `<OfflineSync />`: sincroniza al abrir la app (tras restaurar la caché) y al reconectar |
| `index.ts` | API pública |
| `__tests__/` | Pruebas de la sincronización |

`AppProviders` llama a `configureOfflineQueries` y monta `<OfflineSync />`.

## Agregar una fuente

1. La feature exporta un `OfflineSource` (tipo de `@/lib/offline`) desde su `index.ts`.
2. Se añade a `OFFLINE_SOURCES` en `constants.ts`.

## Reglas

- Importa otras features solo por su `index.ts`.
- Un fallo de una fuente no detiene las demás; la carpeta de archivos de una fuente fallida no se poda.
