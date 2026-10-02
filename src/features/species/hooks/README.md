# src/features/species/hooks/

**Responsabilidad:** queries y mutations de fichas, invalidación de caché y traducción de errores a
`SPECIES_MESSAGES`.

| Hook | Descripción |
|---|---|
| `useSpeciesList(category)` | Listado por categoría |
| `useSpecies(id)` | Detalle |
| `useCreateSpecies` | Crea; invalida el listado de su categoría |
| `useUpdateSpecies` | Edita; invalida detalle y listado; muestra `La ficha se actualizó correctamente.` |
| `useDeleteSpecies` | Elimina tras confirmar; invalida el listado y vuelve atrás |
