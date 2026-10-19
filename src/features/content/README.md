# src/features/content/ — Contenido informativo del humedal (HE-06)

**Responsabilidad:** componentes del humedal (HU-14, HU-15) y anuncios o información educativa
(HU-16, HU-17).

## Estado

| HU | Estado |
|---|---|
| HU-16 Publicar anuncio | ✅ `feature/publicar-anuncios` — `PublishAnnouncementScreen` en `/announcements/new` |
| HU-14 Consultar componentes | ✅ `feature/componentes-humedal` — `/wetland` y `/wetland/:type` |
| HU-15 Editar componentes | ✅ `feature/componentes-humedal` — `/wetland/:type/edit` con `content:manage` |
| HU-17 Ver anuncios | ✅ Listado público en `/announcements`, enlazado desde el menú lateral |

## Contrato (HU-16)

Confirmado en controladores y DTO de `dev`; **aún no está en `docs/api/openapi.json`**:

| Método y ruta | Quién | Cuerpo |
|---|---|---|
| `POST /api/anuncios` | Admin y superadmin | `{ "titulo": string, "descripcion": string }`, ambos obligatorios |
| `GET /api/anuncios` | Público | — (HU-17) |

No se pueden editar ni eliminar anuncios (las HU no lo piden). La app no usa la respuesta del `POST`.

## Contrato (HU-14 y HU-15)

Acordado con Juan Sebastián (backend) por chat; **aún no está en `docs/api/openapi.json`** (brecha B14):

| Método y ruta | Quién | Notas |
|---|---|---|
| `GET /api/componentes` | Público | Lista de componentes |
| `GET /api/componentes/{tipo}` | Público | Ej. `/api/componentes/AVES`; un tipo inexistente responde error |
| `PUT /api/componentes/{tipo}` | Admin y superadmin | `{ "nombre": string, "descripcion": string }` |
| `POST /api/componentes/{tipo}/fotos` | Admin y superadmin | `multipart/form-data`, campo `foto`; jpg o png (400 "El formato de la imagen no es válido."), máx. 10 MB (413), máx. 10 fotos (409); responde 201 con el componente |
| `DELETE /api/componentes/{tipo}/fotos/{idFoto}` | Admin y superadmin | — |

Respuesta de los `GET`:

```json
{
  "tipo": "AVES",
  "nombre": "Aves",
  "descripcion": "El humedal alberga especies residentes y migratorias...",
  "tieneContenido": true,
  "fotos": [{ "id": "9d4e…", "url": "http://…/componentes/4a1f….jpg" }],
  "fechaActualizacion": "2026-10-09T15:30:00.123456Z"
}
```

Sin sesión: 401 "Debe iniciar sesión para acceder a este recurso."; usuario registrado: 403 "No tiene
permisos para realizar esta acción.". Tipos conocidos: `AVES`, `FLORA`, `INSECTOS` (la HU-14 menciona
también el componente hídrico: por definir con el grupo). La app no fija la lista: muestra lo que devuelva
la API y usa un ícono genérico para tipos nuevos.

**GUARDAR CAMBIOS (HU-15 CA1):** la API recibe el texto y cada foto por separado. La app junta los
cambios y al guardar aplica en orden: `PUT` del texto, `DELETE` de las fotos quitadas y `POST` de las
nuevas; al final vuelve a leer el componente. Si un paso falla, los anteriores ya quedaron guardados: la
pantalla quita de la cola las fotos ya subidas y no repite los borrados al reintentar.

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
| `api/wetland-components.api.ts` | `listWetlandComponents`, `getWetlandComponent`, `updateWetlandComponentText`, `addWetlandComponentPhoto`, `deleteWetlandComponentPhoto`, `saveWetlandComponentChanges` |
| `api/wetland-components.mappers.ts` | DTO de la API ↔ `WetlandComponent` (validado con Zod) |
| `components/wetland-components-screen.tsx` | HU-14: un botón por componente |
| `components/wetland-component-detail-screen.tsx` | HU-14: descripción, fotos y fecha (CA1) o mensaje "disponible próximamente" (CA2); **EDITAR CONTENIDO** con `content:manage` |
| `components/edit-wetland-component-screen.tsx` | HU-15: nombre, descripción, fotos (agregar / quitar, contador x de 10) y **GUARDAR CAMBIOS** |
| `components/content-screen-header.tsx` | Encabezado con volver y título centrado |
| `components/pick-component-photo.ts` | Galería con validación local de jpg/png y 10 MB |
| `hooks/use-wetland-components.ts` | Queries del listado y del detalle |
| `hooks/use-save-wetland-component.ts` | Mutation de guardado y `getSaveWetlandComponentErrorMessage` |
| `schemas/wetland-component-*.schema.ts` | Validación de la respuesta y del formulario |
| `types/` | `AnnouncementInput`, `WetlandComponent`, `WetlandComponentChanges` y los DTO de la API |
| `constants.ts` | `CONTENT_MESSAGES` (textos de la HU), `CONTENT_LABELS`, `WETLAND_LABELS`, `ANNOUNCEMENT_LIMITS`, `WETLAND_COMPONENT_LIMITS`, `WETLAND_COMPONENT_ICONS`, `announcementKeys`, `wetlandComponentKeys` |

## Mensajes

| Caso | Mensaje |
|---|---|
| HU-16 CA2 (falta título o contenido) | `Debes completar el título y el contenido del anuncio.` |
| HU-16 CA1 (local, la HU no define texto) | `El anuncio se publicó correctamente.` |
| Respaldo `403` sin mensaje | `No tienes permisos para publicar anuncios.` |
| HU-14 CA2 (sin información publicada, `tieneContenido: false`) | `La información de esta sección estará disponible próximamente.` |
| HU-15 CA1 | `El contenido del componente se actualizó correctamente.` |
| HU-15 nombre o descripción vacíos (local) | `Debes completar el nombre y la descripción del componente.` |
| Foto que no es jpg/png (igual al de la API) | `El formato de la imagen no es válido.` |
| Foto de más de 10 MB (local) | `La imagen supera el tamaño máximo de 10 MB.` |
| 10 fotos (local; la API responde 409) | `Puedes tener máximo 10 fotos por componente.` |

Sin diseño en Figma: las pantallas siguen el estilo del formulario de fichas (encabezado con volver,
campos redondeados, botón principal). Se abre desde el menú lateral → **Gestión de contenido →
Publicar anuncio** (`<Can permission="announcements:publish">`). Los componentes se abren desde
**Humedal → Componentes del humedal** (público).
