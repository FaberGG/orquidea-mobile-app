# src/features/sightings/components/

**Responsabilidad:** pantallas y piezas de la interfaz de HE-07.

## Pantallas

| Componente | Ruta | Descripción |
|---|---|---|
| `CommunityScreen` | `/community` (pestaña) | Foro (HU-20) para todos; pestañas Comunidad / Moderación con `<Can permission="sightings:review">` (HU-19); botón flotante |
| `NewSightingScreen` | `/sightings/new` | Formulario de HU-18 y confirmación de envío (CA1) |
| `PhotoViewerScreen` | `/sightings/photo?uri=` | Foto completa con zoom (pellizcar, doble toque), arrastre y deslizar para cerrar |

## Piezas

| Archivo | Contenido |
|---|---|
| `sightings-list.tsx` | Lista paginada con cargando / error / vacío / éxito, recarga y scroll infinito |
| `sighting-post.tsx` | Publicación del foro, sin tarjeta y con la foto de borde a borde |
| `feed-photo.tsx` | Foto del foro con proporción acotada entre 4:5 y 1.91:1 (`FEED_PHOTO_ASPECT`); abre el visor |
| `sighting-details.tsx` | Reino, clasificación, descripción con "Ver más" y lugar (abre la app de mapas) |
| `sighting-author.tsx` | Iniciales, nombre y fecha / estado |
| `pending-sighting-card.tsx` | Tarjeta de la cola con Aprobar y Rechazar (con confirmación) |
| `community-tabs.tsx` | Pestañas subrayadas Comunidad / Moderación |
| `new-sighting-fab.tsx` | Botón flotante: formulario (usuario) o aviso de iniciar sesión (visitante); oculto para admin+ |
| `login-required-dialog.tsx` | Aviso modal que lleva a `/login` |
| `announcements-button.tsx` | Campana del encabezado; sin destino hasta HU-17 |
| `sighting-form.tsx` | Formulario (React Hook Form + Zod) |
| `sighting-photo-field.tsx` | Foto opcional: subir, cambiar o quitar (una sola: límite de la API) |
| `sighting-location-field.tsx` | Ubicación actual del teléfono con `expo-location` (ADR-0013) |
| `info-note.tsx` | Nota verde de "Revisión administrativa" |
| `pick-sighting-photo.ts` | Galería + validación jpg/png ≤ 10 MB |
| `get-current-location.ts` | Permiso en primer plano + posición actual |
| `format-sighting.ts` | Fecha `dd/mm/aaaa · hh:mm`, iniciales, coordenadas, enlace a mapas y proporción acotada |

Pruebas: `sightings-screens.test.tsx` (criterios de HU-18, HU-19 y HU-20 por rol) y `format-sighting.test.ts`.
