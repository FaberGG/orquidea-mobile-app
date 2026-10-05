# src/features/species/hooks/

**Responsabilidad:** queries de fichas (TanStack Query) y, cuando existan, mutations con invalidación de caché.

| Hook | Descripción | Estado |
|---|---|---|
| `useSpeciesList(category)` | Listado por categoría; la clave incluye la categoría (`speciesKeys.list`) | ✅ |
| `useSpecies(id)` | Detalle (`speciesKeys.detail`) | ✅ |
| `useCreateSpecies` | Crea; invalida el listado | Pendiente (HU-7) |
| `useUpdateSpecies` | Edita; invalida detalle y listado (HU-8) | Pendiente |
| `useDeleteSpecies` | Elimina; ⛔ sin endpoint (docs/api B1) | Bloqueado (HU-9) |
