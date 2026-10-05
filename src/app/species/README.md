# src/app/species/ — Detalle de ficha

**Acceso:** todos los roles.

**Responsabilidad:** ruta de detalle de una ficha taxonómica, fuera de las pestañas para mostrarse a
pantalla completa (sin barra inferior), como en el diseño "Detalle ficha".

| Archivo | URL | Pantalla | HU | Estado |
|---|---|---|---|---|
| `[id].tsx` | `/species/:id` | `SpeciesDetailScreen` de `@/features/species` | HU-10 | ✅ |

Las acciones **Editar** (`/species/:id/edit`, HU-8) y **Eliminar** (HU-9) solo aparecen con su permiso
(`species:update` / `species:delete`). Están deshabilitadas: la pantalla de edición llega con HU-8 y la API
aún no tiene el endpoint de eliminar (docs/api B1).

En HE-04 esta ruta también será el destino del escaneo de códigos QR, por eso debe funcionar con
deep links (`orquideamobileapp://species/<id>`).
