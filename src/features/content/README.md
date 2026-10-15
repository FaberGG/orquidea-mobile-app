# src/features/content/ — Contenido informativo del humedal (HE-06)

**Responsabilidad:** componentes del humedal (HU-14, HU-15) y anuncios o información educativa
(HU-16, HU-17).

## Estado

| HU | Estado |
|---|---|
| HU-16 Publicar anuncio | ✅ `feature/publicar-anuncios` — `PublishAnnouncementScreen` en `/announcements/new` |
| HU-14, HU-15 Componentes | Pendiente en front; el backend ya ofrece su contrato en `dev` |
| HU-17 Ver anuncios | ✅ Listado público en `/announcements`, enlazado desde el menú lateral |

## Contrato (HU-16)

Confirmado en controladores y DTO de `dev`; **aún no está en `docs/api/openapi.json`**:

| Método y ruta | Quién | Cuerpo |
|---|---|---|
| `POST /api/anuncios` | Admin y superadmin | `{ "titulo": string, "descripcion": string }`, ambos obligatorios |
| `GET /api/anuncios` | Público | — (HU-17) |

No se pueden editar ni eliminar anuncios (las HU no lo piden). La app no usa la respuesta del `POST`.

## Contenido

| Carpeta / archivo | Contenido |
|---|---|
| `api/announcements.api.ts` | `createAnnouncement` y `listAnnouncements`; lectura pública sin token |
| `api/announcements.mappers.ts` | Validación y traducción DTO → `Announcement` |
| `components/publish-announcement-screen.tsx` | Formulario con título, contenido y **PUBLICAR**; al publicar limpia el formulario y confirma |
| `components/announcements-list-screen.tsx` | HU-17: lista con carga, vacío, error y actualización manual |
| `components/announcement-card.tsx` | Tarjeta con título, fecha de publicación y contenido completo |
| `hooks/use-create-announcement.ts` | Mutation (invalida `announcementKeys.all`) y `getPublishAnnouncementErrorMessage` |
| `hooks/use-announcements.ts` | Query pública `announcementKeys.list()` y manejo del error de lectura |
| `schemas/announcement-form.schema.ts` | Título y contenido obligatorios (CA2), con longitudes máximas provisionales |
| `schemas/announcement-list.schema.ts` | Validación de la respuesta recibida del backend |
| `types/` | `AnnouncementInput`, `Announcement` y DTO de respuesta |
| `constants.ts` | Textos de HU-16/HU-17, `ANNOUNCEMENT_LIMITS` y `announcementKeys` |

## Mensajes

| Caso | Mensaje |
|---|---|
| HU-16 CA2 (falta título o contenido) | `Debes completar el título y el contenido del anuncio.` |
| HU-16 CA1 (local, la HU no define texto) | `El anuncio se publicó correctamente.` |
| Respaldo `403` sin mensaje | `No tienes permisos para publicar anuncios.` |

Sin diseño en Figma: la pantalla sigue el estilo del formulario de fichas (encabezado con volver,
campos redondeados, botón principal). Se abre desde el menú lateral → **Gestión de contenido →
Publicar anuncio** (`<Can permission="announcements:publish">`).
