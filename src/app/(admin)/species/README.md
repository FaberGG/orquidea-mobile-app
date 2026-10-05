# src/app/(admin)/species/ — Crear y editar ficha

**Acceso:** administrador y superadministrador (`species:create`).

| Archivo | URL | Pantalla | HU | Permiso |
|---|---|---|---|---|
| `new.tsx` | `/species/new` | `SpeciesCreateScreen` | HU-7 | `species:create` |
| `[id]/edit.tsx` | `/species/:id/edit` | `SpeciesEditScreen` | HU-8 | `species:update` |

Al crear, la app vuelve al listado (`/`) y el listado se actualiza. Al editar, el mensaje
`La ficha se actualizó correctamente.` aparece bajo el formulario.
