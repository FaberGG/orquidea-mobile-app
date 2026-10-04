# src/features/home/ — Inicio

**Responsabilidad:** pantalla de inicio (`/`), común a todos los roles. Muestra las opciones habilitadas
para el rol del usuario (HU-1 CA1) usando `<Can>`, nunca comparando roles.

| Archivo | Contenido |
|---|---|
| `components/home-screen.tsx` | `HomeScreen`: saludo, invitación a iniciar sesión (visitante) y opciones por permiso |
| `components/home-option.tsx` | Tarjeta de una opción |
| `index.ts` | Exporta `HomeScreen` |

Las opciones aún no navegan: cada una se enlaza a su ruta cuando se implemente su HU
(HU-10 fichas, HU-7/HU-8 gestión de fichas, HU-4/HU-5 administradores).
