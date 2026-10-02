# src/app/(admin)/species/ — Formularios de fichas

**Acceso:** administrador y superadministrador (`species:create`, `species:update`).

| Archivo | URL | Pantalla (`@/features/species`) | HU |
|---|---|---|---|
| `new.tsx` | `/species/new` | `CreateSpeciesScreen` | HU-7 |
| `[id]/edit.tsx` | `/species/:id/edit` | `EditSpeciesScreen` | HU-8 |

Ambas pantallas reutilizan el mismo `SpeciesForm`. Al guardar se invalida la caché del listado y del detalle.
**CANCELAR** en edición descarta cambios y regresa a la ficha (`router.back()`).
