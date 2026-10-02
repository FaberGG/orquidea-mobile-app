# src/app/species/ — Detalle de ficha

**Acceso:** todos los roles.

**Responsabilidad:** ruta de detalle de una ficha taxonómica, fuera de las pestañas para mostrarse a
pantalla completa sobre el shell.

| Archivo | URL | Pantalla | HU |
|---|---|---|---|
| `[id].tsx` | `/species/:id` | `SpeciesDetailScreen` de `@/features/species` | HU-10, HU-8, HU-9 |

La pantalla es la misma para todos los roles. Los administradores ven además:

- **Editar** → `/species/:id/edit` (`<Can permission="species:update">`, HU-8).
- **Eliminar** con confirmación (`<Can permission="species:delete">`, HU-9).

En HE-04 esta ruta también será el destino del escaneo de códigos QR, por eso debe funcionar con
deep links (`orquideamobileapp://species/<id>`).
