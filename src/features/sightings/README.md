# src/features/sightings/ — Avistamientos (HE-07)

**Responsabilidad:** reporte ciudadano de avistamientos y su moderación. Es la pestaña **Comunidad**.
Diseño: Figma, sección *HE-07 Reporte Ciudadano*. Contrato: [`docs/api/reportes-avistamiento.md`](../../../docs/api/reportes-avistamiento.md).
Diferencias con el diseño y pendientes: [`docs/sprints/he-07-pendientes.md`](../../../docs/sprints/he-07-pendientes.md).

## Historias

| HU | Descripción | Rol | Estado |
|---|---|---|---|
| HU-20 | Foro de avistamientos aprobados | Todos (incluido visitante) | ✅ Feed paginado con foto de borde a borde y visor con zoom |
| HU-18 | Crear reporte | Solo usuario registrado (`sightings:create`) | ✅ `/sightings/new`; el visitante ve un aviso para iniciar sesión |
| HU-19 | Revisar y aprobar / rechazar reportes | Admin+ (`sightings:review`) | ✅ Pestaña "Moderación" con la cola de pendientes |
| HU-22 | Crear reporte sin conexión | Usuario registrado | Pendiente (HE-08) |

## Misma pantalla, distintas capacidades

| Elemento de Comunidad | Visitante | Usuario | Admin | Superadmin |
|---|:-:|:-:|:-:|:-:|
| Foro de aprobados | ✔ | ✔ | ✔ | ✔ |
| Botón flotante → formulario | — | ✔ | — | — |
| Botón flotante → aviso de iniciar sesión | ✔ | — | — | — |
| Pestañas Comunidad / Moderación | — | — | ✔ | ✔ |

Los administradores no crean reportes porque la API lo prohíbe (`403`); por eso `sightings:create` no se
hereda (ver `docs/architecture/ROLES-Y-PERMISOS.md`).

## Archivos

| Carpeta / archivo | Contenido |
|---|---|
| [`api/`](api/README.md) | Llamadas a `/api/reportes-avistamiento` y mapeo `OccurrenceDto` ⇄ `Sighting` |
| [`hooks/`](hooks/README.md) | Queries paginadas (foro y cola) y mutations (crear, aprobar/rechazar) |
| [`schemas/`](schemas/README.md) | Validación del DTO y del formulario |
| [`types/`](types/README.md) | `Sighting`, `SightingInput`, `Kingdom`… |
| [`components/`](components/README.md) | Pantallas (Comunidad, formulario, visor de foto) y sus piezas |
| `constants.ts` | Textos (`SIGHTINGS_LABELS`, `SIGHTING_FORM_LABELS`), mensajes de los criterios (`SIGHTINGS_MESSAGES`), reinos, proporciones del foro y claves de caché |
| `index.ts` | Exporta `CommunityScreen`, `NewSightingScreen`, `PhotoViewerScreen`, `AnnouncementsButton` y `SIGHTINGS_LABELS` |
