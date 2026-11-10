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

## Contrato (HU-16, HU-17 y HU-23)

Confirmado en controladores y DTO de `dev` del backend (Santiago, 30/10/2026); **aún no está en
`docs/api/openapi.json`**:

| Método y ruta | Quién | Cuerpo / respuesta |
|---|---|---|
| `POST /api/anuncios` | Admin y superadmin | `{ "titulo", "descripcion", "prioridad": "ALTA" \| "MEDIA" \| "BAJA", "fechaExpiracion"?: instante ISO }`; título (máx. 150), contenido (máx. 1000) y prioridad obligatorios |
| `GET /api/anuncios` | Público | Solo los activos y no vencidos (HU-17) |
| `GET /api/anuncios/administracion` | Admin y superadmin | Todos, también inactivos y vencidos (para HU-24) |

| `PATCH /api/anuncios/{id}/ocultar` | Admin y superadmin | Pasa el anuncio a `INACTIVO` (HU-24 CA1); `404` si no existe |
| `PATCH /api/anuncios/{id}/mostrar` | Admin y superadmin | Pasa el anuncio a `ACTIVO` (HU-24 CA2); `409` "No puedes mostrar un anuncio que ya expiró." |

Cada anuncio responde además `estado` (`ACTIVO` / `INACTIVO`), `expirado` (lo calcula el back) y
`fechaCreacion` (inicio de la vigencia). En la vista del administrador se muestra **Expirado** si
`expirado` es `true`, **Oculto** si está `INACTIVO` y **Visible** en otro caso. La app no usa la respuesta del
`POST` ni de los `PATCH`: refresca las listas.
En el listado público se indica la fecha y hora de finalización cuando `fechaExpiracion` está presente;
los anuncios sin fecha solo muestran la fecha de publicación.
La tarjeta pública deja título y descripción arriba y las fechas al pie. Está preparada para añadir
`por [nombre]` junto a la fecha cuando la API incluya `nombrePublicador`. El backend actual no guarda
ni devuelve al publicador: debe registrar al usuario autenticado al crear el anuncio y exponer su
nombre público en `GET /api/anuncios`. Para anuncios anteriores sin autor registrado, omitir el nombre.

## Contrato (HU-14 y HU-15)

Acordado con Juan Sebastián (backend) por chat; **aún no está en `docs/api/openapi.json`** (brecha B14):

| Método y ruta | Quién | Notas |
|---|---|---|
| `GET /api/componentes` | Público | Lista de componentes |
| `GET /api/componentes/{tipo}` | Público | Ej. `/api/componentes/AVES`; un tipo inexistente responde error |
| `POST /api/componentes` | Admin y superadmin | HU-25: `{ "nombre", "descripcion" }` (máx. 100 / 5000); responde 201 con el componente y su `tipo` (código generado del nombre, p. ej. `COMPONENTE_HIDRICO`); 409 "Ya existe un componente con ese nombre." |
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
| `api/announcements.api.ts` | `createAnnouncement`, `listAnnouncements` (pública, sin token), `listAdminAnnouncements`, `hideAnnouncement` / `showAnnouncement` y `updateAnnouncement` (solo envía lo que cambió) |
| `api/announcements.mappers.ts` | Validación y traducción DTO → `Announcement`, incluida la prioridad de la respuesta |
| `components/announcement-form.tsx` | Formulario compartido de publicar y editar: título, contenido, prioridad (Alta / Media / Baja) y fecha de finalización opcional |
| `components/publish-announcement-screen.tsx` | HU-16/HU-23: **PUBLICAR**; al publicar limpia el formulario y confirma |
| `components/edit-announcement-screen.tsx` | SCRUM-71: **GUARDAR CAMBIOS** de prioridad, vigencia y texto (`PATCH /api/anuncios/{id}/actualizar`). Una fecha de finalización ya puesta se puede cambiar, pero no quitar (la API ignora los campos vacíos) |
| `hooks/use-manage-announcements.ts` | Query de la vista del administrador, mutations de ocultar / mostrar y de editar, y sus mensajes de error |
| `components/expiration-field.tsx` / `.web.tsx` | Fecha y hora de finalización (HU-23): diálogos de fecha y hora en Android, selector en línea en iOS y `datetime-local` en web |
| `components/announcements-list-screen.tsx` | HU-17 + SCRUM-71: una sola lista para todos. Visitante y usuario ven los visibles y vigentes; con `announcements:manage` se ven todos con su estado y cada tarjeta trae **EDITAR** y **OCULTAR** / **MOSTRAR** (HU-24). Reemplaza a la antigua pantalla "Gestionar anuncios" |
| `components/announcement-card.tsx` | Tarjeta con título y chip de prioridad arriba (los de prioridad alta llevan además un borde rojo), estado si se gestiona, descripción, fechas y acciones al pie |
| `components/create-announcement-button.tsx` | Botón "+" del encabezado de Anuncios que abre `/announcements/new` (Acta 17); solo con `announcements:publish` |
| `hooks/use-create-announcement.ts` | Mutation (invalida `announcementKeys.all`) y `getPublishAnnouncementErrorMessage` |
| `hooks/use-announcements.ts` | Query pública `announcementKeys.list()`, `useAnnouncementList(canManage)` (pública o del administrador según el permiso) y manejo del error de lectura |
| `schemas/announcement-form.schema.ts` | Título y contenido obligatorios (CA2), prioridad obligatoria (CA3) y fecha de finalización posterior a la actual (HU-23 CA3) |
| `schemas/announcement-list.schema.ts` | Validación de la respuesta recibida del backend |
| `types/` | `AnnouncementInput`, `Announcement` y DTO de respuesta |
| `constants.ts` | Textos de HU-16/HU-17, `ANNOUNCEMENT_LIMITS` y `announcementKeys` |
| `api/wetland-components.api.ts` | `listWetlandComponents`, `getWetlandComponent`, `updateWetlandComponentText`, `addWetlandComponentPhoto`, `deleteWetlandComponentPhoto`, `saveWetlandComponentChanges` |
| `api/wetland-components.mappers.ts` | DTO de la API ↔ `WetlandComponent` (validado con Zod) |
| `components/wetland-components-screen.tsx` | HU-14: un botón por componente |
| `components/wetland-component-detail-screen.tsx` | HU-14: descripción, fotos y fecha (CA1) o mensaje "disponible próximamente" (CA2); **EDITAR CONTENIDO** con `content:manage` |
| `components/create-wetland-component-screen.tsx` | HU-25: nombre, descripción y fotos; **GUARDAR COMPONENTE** crea el componente (`POST /api/componentes`) y luego sube las fotos. Se abre con **NUEVO COMPONENTE** en la lista de componentes |
| `components/component-photos-field.tsx` | Fotos compartidas por HU-15 y HU-25: miniaturas, quitar, agregar y contador x de 10 |
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
| HU-16 CA3 (sin prioridad; igual al de la API) | `Debes seleccionar la prioridad del anuncio.` |
| HU-23 CA3 (fecha pasada o actual; igual al de la API) | `La fecha de finalización debe ser posterior a la fecha actual.` |
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
