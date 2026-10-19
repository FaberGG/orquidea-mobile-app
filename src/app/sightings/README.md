# src/app/sightings/ — Reportes de avistamiento (HE-07)

**Responsabilidad:** rutas de HE-07 que se muestran fuera de las pestañas, a pantalla completa. El foro vive
en la pestaña [`(drawer)/(tabs)/community.tsx`](../%28drawer%29/%28tabs%29/README.md).

| Archivo | URL | Pantalla | Acceso | HU |
|---|---|---|---|---|
| `new.tsx` | `/sightings/new` | `NewSightingScreen` | `Stack.Protected` con `sightings:create` (solo usuario registrado) | HU-18 |
| `photo.tsx` | `/sightings/photo?uri=` | `PhotoViewerScreen` (modal transparente con fundido) | Todos | HU-20 |

Ambas se declaran en el `Stack` raíz (`src/app/_layout.tsx`). Sin `uri`, `photo.tsx` redirige a `/community`.
