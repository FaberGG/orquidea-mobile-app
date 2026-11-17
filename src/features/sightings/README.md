# src/features/sightings/ — Avistamientos (HE-07)

**Responsabilidad:** reporte ciudadano de avistamientos y su moderación. Es la pestaña **Comunidad**.
Diseño: Figma, sección *HE-07 Reporte Ciudadano*. Contrato: [`docs/api/reportes-avistamiento.md`](../../../docs/api/reportes-avistamiento.md).
Diferencias con el diseño y pendientes: [`docs/sprints/he-07-pendientes.md`](../../../docs/sprints/he-07-pendientes.md).

## Historias

| HU | Descripción | Rol | Estado |
|---|---|---|---|
| HU-20 | Foro de avistamientos aprobados | Todos (incluido visitante) | ✅ Feed paginado con foto de borde a borde y visor con zoom |
| HU-18 | Crear reporte | Usuario registrado, administrador y superadministrador (`sightings:create`, v2.0) | ✅ `/sightings/new`; el visitante ve un aviso para iniciar sesión |
| HU-19 | Revisar y aprobar / rechazar reportes | Admin+ (`sightings:review`) | ✅ Pestaña "Moderación" con la cola de pendientes |
| HU-22 | Crear reporte sin conexión y sincronizar al volver la señal | Quien puede crear reportes (`sightings:create`) | ✅ Front (SCRUM-70): cola en el teléfono, envío automático, REINTENTAR / DESCARTAR. Falta el back (SCRUM-66) para que reenviar no duplique |

## Misma pantalla, distintas capacidades

| Elemento de Comunidad | Visitante | Usuario | Admin | Superadmin |
|---|:-:|:-:|:-:|:-:|
| Foro de aprobados | ✔ | ✔ | ✔ | ✔ |
| Botón flotante → formulario | — | ✔ | ✔ | ✔ |
| Botón flotante → aviso de iniciar sesión | ✔ | — | — | — |
| Pestañas Comunidad / Moderación | — | — | ✔ | ✔ |

Desde HU-18 v2.0 (SCRUM-60) los administradores también crean reportes, así que `sightings:create` se
hereda (ver `docs/architecture/ROLES-Y-PERMISOS.md`). La API debe aceptarlos (backend SCRUM-48); mientras
no lo haga, responde `403` y el formulario muestra el mensaje de permisos.

## Archivos

| Carpeta / archivo | Contenido |
|---|---|
| [`api/`](api/README.md) | Llamadas a `/api/reportes-avistamiento` y mapeo `OccurrenceDto` ⇄ `Sighting` |
| [`hooks/`](hooks/README.md) | Queries paginadas (foro y cola) y mutations (crear, aprobar/rechazar) |
| [`schemas/`](schemas/README.md) | Validación del DTO y del formulario |
| [`types/`](types/README.md) | `Sighting`, `SightingInput`, `Kingdom`… |
| [`components/`](components/README.md) | Pantallas (Comunidad, formulario, visor de foto) y sus piezas |
| `queue/` | HU-22: cola de reportes sin conexión (`sighting-queue.ts`) y su envío (`sync-sighting-queue.ts`). Ver la sección siguiente |
| `constants.ts` | Textos (`SIGHTINGS_LABELS`, `SIGHTING_FORM_LABELS`), mensajes de los criterios (`SIGHTINGS_MESSAGES`), reinos, proporciones del foro y claves de caché |
| `index.ts` | Exporta `CommunityScreen`, `NewSightingScreen`, `PhotoViewerScreen`, `AnnouncementsButton` y `SIGHTINGS_LABELS` |

## Reportes sin conexión (HU-22, SCRUM-70)

Usa la base offline de SCRUM-63 (`@/lib/offline`, guía `docs/architecture/OFFLINE.md` §5).

- **Guardar (CA1):** si `useNetworkStatus` dice `offline`, o si el envío falla por red o tiempo agotado, el
  formulario guarda el reporte en el kv-store (`orquidea.sightings-queue`) como `pending`, con un UUID del
  teléfono (`expo-crypto`), el usuario dueño y la fecha. La foto se copia a
  `offline-files/pending-sightings/<uuid>.<ext>` (la URI del selector puede desaparecer). Un error de la
  API (`4xx`) no se guarda: se muestra como antes.
- **Sincronizar (CA2):** `SightingQueueSync` (montado en `AppProviders`, dentro de la sesión) envía la
  cola cuando hay sesión, la red no está caída y hay pendientes: al abrir la app, al volver la señal, al
  iniciar sesión de nuevo, al guardar uno nuevo o al pulsar REINTENTAR. Envía de uno en uno, en orden, con
  `createSighting(input, id)` (el `id` viaja en el multipart). Al terminar avisa *"Datos sincronizados
  correctamente."*.
- **Errores:** `4xx` → `failed` con el mensaje de la API (no se reintenta solo); `401` → `needs-login` (se
  envía al volver a iniciar sesión); red, tiempo o `5xx` → se para y se reintenta después.
- **Interfaz:** en Comunidad, arriba del foro, "Tus reportes sin enviar (N)" con el estado de cada uno y
  REINTENTAR (deshabilitado sin red) / DESCARTAR (con confirmación).
- **Solo del dueño:** cada usuario ve y envía solo sus reportes; si inicia sesión otra persona en el mismo
  teléfono, los de la primera se quedan guardados hasta que ella vuelva.
- **Duplicados:** un reporte sale de la cola solo cuando la API confirma. Si la respuesta se pierde después
  de que el back guardó, el reenvío podría duplicarlo hasta que el back use el `id` (SCRUM-66, brecha B15).
  Mientras tanto, la moderación filtra el duplicado.
- **CA3 (conflictos):** no aplica a reportes (solo se crean, no se editan).
