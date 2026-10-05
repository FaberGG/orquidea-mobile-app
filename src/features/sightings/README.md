# src/features/sightings/ — Avistamientos (HE-07)

**Responsabilidad:** reporte ciudadano de avistamientos y su moderación. Es la pestaña **Comunidad**.

| HU | Descripción | Rol |
|---|---|---|
| HU-20 | Foro de avistamientos aprobados | Todos |
| HU-18 | Crear reporte | Usuario registrado+ |
| HU-19 | Revisar y aprobar / rechazar reportes | Admin+ |
| HU-22 | Crear reporte sin conexión | Usuario registrado+ |

| Archivo | Contenido |
|---|---|
| `components/community-screen.tsx` | `CommunityScreen`: por ahora un estado vacío que ocupa la pestaña |
| `constants.ts` | `SIGHTINGS_LABELS` |
| `index.ts` | Exporta `CommunityScreen` |

Los permisos previstos (`sightings:create`, `sightings:review`) se agregan a la matriz cuando se implemente
la épica (ver `docs/architecture/ROLES-Y-PERMISOS.md` §4).
