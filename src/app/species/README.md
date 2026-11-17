# src/app/species/ — Detalle de ficha

**Acceso:** todos los roles.

**Responsabilidad:** ruta de detalle de una ficha taxonómica, fuera de las pestañas para mostrarse a
pantalla completa (sin barra inferior), como en el diseño "Detalle ficha".

| Archivo | URL | Pantalla | HU | Estado |
|---|---|---|---|---|
| `[id].tsx` | `/species/:id` | `SpeciesDetailScreen` de `@/features/species` | HU-10 | ✅ |

La acción **Editar** (`/species/:id/edit`, HU-8) solo aparece con `species:update`. **Eliminar** (HU-9) no se
muestra: la API aún no tiene el endpoint (docs/api B1).

En HE-04 esta ruta también será el destino del escaneo de códigos QR, por eso debe funcionar con
deep links (`orquideamobileapp://species/<id>`).
