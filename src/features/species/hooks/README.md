# src/features/species/hooks/

**Responsabilidad:** queries de fichas (TanStack Query) y, cuando existan, mutations con invalidación de caché.

| Hook | Descripción | Estado |
|---|---|---|
| `useSpeciesList(category)` | Listado por categoría: lee la copia local (`speciesKeys.catalog()`) y filtra con `select`; cambiar de chip no pide nada a la API. Al montarse sincroniza los cambios (HU-21) | ✅ |
| `useSpecies(id)` | Detalle (`speciesKeys.detail`) | ✅ |
| `prefetchSpeciesForOffline` / `speciesOfflineSource` | HU-21: sincroniza la copia local por cambios (`syncSpeciesCatalog`), siembra los detalles, quita los eliminados y devuelve las URLs de fotos (miniaturas y fotos). Lo registra `features/offline` | ✅ |
| `useSpeciesQr(id)` | Descarga administrativa bajo demanda, PNG en caché local y menú nativo para guardar/compartir; cancela al desmontar | HU-11; pendiente validación física |
| `useQrResolution()` | Consulta fresca aislada por sesión/intento; valida UUID, escribe el éxito en el detalle normal y cancela al salir. `hasSavedSpecies(id)`: sin red confirmada abre la copia guardada (HU-21, ADR-0017) | HU-11 | En implementación |
| `useCreateSpecies` | Crea; invalida el listado | Pendiente (HU-7) |
| `useUpdateSpecies` | Edita; invalida detalle y listado (HU-8) | Pendiente |
| `useDeleteSpecies` | Elimina; ⛔ sin endpoint (docs/api B1) | Bloqueado (HU-9) |
