# Estaciones del sendero (HU-13): contrato inferido

> **Estado:** implementado en el frontend (rama `feature/gestion-estaciones`, tarea
> [SCRUM-54](https://humedal-orquidea.atlassian.net/browse/SCRUM-54)) **antes** de que exista en el backend
> ([SCRUM-40](https://humedal-orquidea.atlassian.net/browse/SCRUM-40)). El contrato parte de la sugerencia de
> SCRUM-40 y lo completa con las decisiones que el frontend necesitó tomar. Si el backend lo implementa distinto,
> la sección [Si el contrato cambia](#si-el-contrato-cambia) lista qué archivos tocar.

## Historia

Yo como ADMINISTRADOR o SUPERADMINISTRADOR necesito gestionar las estaciones del mapa (crear, editar o eliminar).
Cada estación tiene nombre, descripción, foto, coordenadas y, de forma opcional, una o más fichas taxonómicas
asociadas.

| CA | Resultado | Dónde |
|---|---|---|
| 1 | GUARDAR ESTACIÓN → la estación se agrega (al mapa; hoy, al listado) | `StationCreateScreen` |
| 2 | GUARDAR CAMBIOS → 'La estación se actualizó correctamente.' | `StationEditScreen` |
| 3 | Coordenadas inválidas → 'Las coordenadas ingresadas no son válidas.' | `stationFormSchema` y `400` del backend |
| 4 | Fichas asociadas → la estación muestra los enlaces a sus fichas | `StationDetailScreen` |
| 5 | ELIMINAR → CONFIRMAR la quita; CANCELAR la deja igual | `DeleteStationDialog` |

## Navegación provisional (sin mapa)

Para llegar a editar una estación primero se pasa por su detalle ("Ver estación"). Los usuarios normales
llegarán a ese detalle desde el mapa (HU-12), que aún no existe. Mientras tanto:

- El menú lateral tiene **Estaciones del sendero** (`/stations`) para todos los roles.
- `/stations/:id` es "Ver estación", pública.
- **+** (crear), **Editar estación** y **ELIMINAR** solo aparecen con `stations:manage` (admin y superadmin).
- Crear y editar viven en `(admin)/stations/` (`/stations/new`, `/stations/:id/edit`).

Cuando exista el mapa se unificarán UI y UX: tocar una estación del mapa abrirá `/stations/:id`.

## Contrato que espera la app

Sigue las convenciones de `openapi.json`: ids `uuid`, `decimalLatitude` y `decimalLongitude` como en reportes,
multipart para la foto y errores `ApiErrorResponse` con `mensaje`.

### `EstacionDto`

```jsonc
{
  "id": "uuid",
  "nombre": "Mirador de la laguna",
  "descripcion": "Desde aquí se observan garzas…",
  "urlFoto": "http://…/estaciones/uuid.jpg",
  "decimalLatitude": 2.4598,
  "decimalLongitude": -76.6115,
  "fichas": [
    { "id": "uuid-ficha", "vernacularName": "Garza real", "urlFoto": "http://…/fichas/f1.jpg" }
  ]
}
```

`fichas` siempre va presente: es una lista vacía si la estación no tiene fichas asociadas. Su `urlFoto` es la
foto principal de la ficha. Este mismo DTO lo usa `GET /api/mapa` de HU-12 (SCRUM-39).

### Endpoints

| Método y ruta | Auth | Cuerpo | Respuesta | Errores |
|---|---|---|---|---|
| `GET /api/estaciones` | Público | — | `200` `EstacionDto[]`, sin paginar, ordenadas por nombre | — |
| `GET /api/estaciones/{id}` | Público | — | `200` `EstacionDto` | `404` |
| `POST /api/estaciones` | Admin+ | `multipart/form-data`: `nombre`, `descripcion`, `decimalLatitude`, `decimalLongitude`, `foto` (obligatoria) y `fichaIds` (opcional) | `201` `EstacionDto` | `400` (ver mensajes) · `401` · `403` · `413` |
| `PUT /api/estaciones/{id}` | Admin+ | Igual que crear, con `foto` **opcional** | `200` `EstacionDto` | `400` · `401` · `403` · `404` · `413` |
| `DELETE /api/estaciones/{id}` | Admin+ | — | `204` | `401` · `403` · `404` |

### Campos del multipart

| Campo | Regla |
|---|---|
| `nombre` | Obligatorio, de 1 a 150 caracteres |
| `descripcion` | Obligatoria, de 1 a 2000 caracteres |
| `decimalLatitude` / `decimalLongitude` | Obligatorios, con punto decimal (`2.4598`). Latitud entre -90 y 90; longitud entre -180 y 180 |
| `foto` | jpg o png de 10 MB como máximo. Obligatoria al crear; al editar, si no llega, se conserva la actual |
| `fichaIds` | **Un solo campo con los ids separados por comas** (`id1,id2`). Con `List<UUID> fichaIds` en Spring también funciona el campo repetido. **En `PUT` la lista reemplaza las asociaciones**: si el campo no llega, la estación queda sin fichas |

**Por qué `fichaIds` va separado por comas:** la app sube la foto con `File.upload` de `expo-file-system`, cuyos
`parameters` son un `Record<string, string>` y no permiten repetir un campo. Spring convierte `"id1,id2"` en
`List<UUID>` automáticamente con `@RequestParam` o `@ModelAttribute`.

**Por qué `PUT` reemplaza las fichas:** un multipart no puede enviar una lista vacía. Como la app manda siempre
la lista completa, "sin campo" significa "sin fichas".

### Mensajes de error (`mensaje` en `ApiErrorResponse`)

| Caso | Estado | `mensaje` |
|---|---|---|
| Faltan campos obligatorios (incluida la foto al crear) | `400` | `Debes completar todos los campos obligatorios.` |
| Coordenadas fuera de rango o no numéricas (CA3) | `400` | `Las coordenadas ingresadas no son válidas.` |
| Formato de imagen | `400` | `El formato de la imagen no es válido.` |
| Alguna ficha de `fichaIds` no existe | `400` | `Alguna de las fichas asociadas no existe.` |
| Foto mayor a 10 MB | `413` | El que defina el backend |
| Estación inexistente | `404` | `La estación no existe.` |

La app muestra siempre el `mensaje` del servidor; si no llega, usa sus textos de `STATION_MESSAGES`. El mensaje
del CA2 ('La estación se actualizó correctamente.') lo muestra la app al recibir `200`: el backend no necesita
enviarlo.

### Modelo de datos sugerido

- `estacion`: `id uuid`, `nombre`, `descripcion`, `url_foto`, `ubicacion geometry(Point, 4326)` (o columnas
  `latitud` / `longitud`), `creado_en`, `actualizado_en`.
- `estacion_ficha`: tabla de relación muchos a muchos `(estacion_id, ficha_id)`. Al borrar una estación se borran
  sus filas; al borrar una ficha (HU-9), también.
- La estación **no** queda atada a un humedal en particular.

## Implementación en la app

| Archivo | Qué hace |
|---|---|
| `src/features/map/schemas/station-dto.schema.ts` | Valida `EstacionDto` |
| `src/features/map/api/stations.mappers.ts` | `EstacionDto → Station`; `toStationFields` arma el multipart (`fichaIds` separado por comas, omitido si está vacío) |
| `src/features/map/api/stations.api.ts` | `listStations`, `getStation`, `createStation`, `updateStation`, `deleteStation`; con foto usa `uploadMultipart` (campo `foto`), sin foto `apiClient` con `FormData` |
| `src/features/map/hooks/use-stations.ts` | Consultas, mutaciones y mensajes de error |
| `src/features/map/schemas/station-form.schema.ts` | Validación del formulario (CA3 por rango) |
| `src/features/map/components/*` | Listado, "Ver estación", formulario, selector de fichas y confirmación de eliminar |
| `src/features/map/constants.ts` | Textos (`STATION_MESSAGES` con los mensajes de los criterios) y `STATION_LIMITS` |
| `src/permissions/permissions.ts` | Permiso `stations:manage` (admin y superadmin) |
| `src/app/stations/*`, `src/app/(admin)/stations/*` | Rutas |
| `src/features/navigation/components/app-drawer-content.tsx` | Entrada provisional **Estaciones del sendero** |

Pruebas: `api/stations.api.test.ts` (incluye los mapeos), `schemas/station-form.schema.test.ts` y
`components/stations-screens.test.tsx`.

## Si el contrato cambia

| Si el backend… | Cambiar |
|---|---|
| Usa otra ruta base (p. ej. `/api/mapa/estaciones`) | `STATIONS_PATH` en `stations.api.ts` |
| Renombra campos del DTO o de las fichas | `station-dto.schema.ts` y `toStation` en `stations.mappers.ts` |
| Renombra campos del multipart o el de la foto | `toStationFields` (`stations.mappers.ts`) y el último argumento de `uploadMultipart` (`stations.api.ts`) |
| Exige `fichaIds` repetido y no acepta comas | `toStationFields`/`toStationFormData`, y `src/lib/api/multipart.ts` para poder repetir campos (hoy no se puede con la subida nativa) |
| Recibe las fichas en JSON (`application/json`) separado de la foto | `stations.api.ts` (una petición JSON y otra para la foto, como los componentes del humedal) |
| No tiene `GET /api/estaciones/{id}` | `getStation`: buscar en `listStations()` o en `GET /api/mapa` |
| En `PUT` conserva las fichas cuando no llega `fichaIds` | `toStationFields`: enviar una marca explícita para "sin fichas" (a acordar) |
| Devuelve el detalle de las fichas con otros campos (p. ej. `scientificName`) | `stationSpeciesDtoSchema`, `StationSpecies` y `StationDetailScreen` |
| Cambia límites (nombre, descripción, tamaño de foto) | `STATION_LIMITS` y `STATION_MESSAGES` en `constants.ts` |
| Usa otro rol o permiso | `stations:manage` en `src/permissions/permissions.ts` |
