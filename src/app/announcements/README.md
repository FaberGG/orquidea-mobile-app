# src/app/announcements/ — Lista de anuncios (HU-17)

**Acceso:** todos los roles (menú lateral → Anuncios, o la campana de Comunidad).

**Responsabilidad:** ruta pública de la lista de anuncios, fuera de las pestañas: sin menú lateral ni barra
inferior, con botón de volver, título y, con `announcements:publish`, el botón "+" en el encabezado (lo dibuja la propia
pantalla).

| Archivo | URL | Pantalla | HU | Estado |
|---|---|---|---|---|
| `index.tsx` | `/announcements` | `AnnouncementsListScreen` de `@/features/content` | HU-17, SCRUM-71 | ✅ |

Publicar (`/announcements/new`) y editar (`/announcements/:id/edit`) viven en [`(admin)/`](../(admin)/README.md).
Quien gestiona anuncios (`announcements:manage`) ve las pestañas **Visibles** y **Ocultos** (los ocultos y los expirados).
