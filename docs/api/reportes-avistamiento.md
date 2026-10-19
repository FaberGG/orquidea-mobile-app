# API de reportes de avistamiento (reporte ciudadano)

Documentación de los endpoints de `OccurrenceController` (`src/main/java/com/orquidea/api/controllers/OccurrenceController.java`).
Cubre las historias de usuario:

- **HU-18**: un usuario registrado crea un reporte de avistamiento.
- **HU-19**: un administrador revisa (aprueba o rechaza) los reportes pendientes.
- **HU-20**: el foro público muestra los reportes aprobados.

Ruta base: `/api/reportes-avistamiento`

## Resumen

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/reportes-avistamiento` | Crear reporte (multipart) | `USUARIO_REGISTRADO` |
| GET | `/api/reportes-avistamiento` | Foro público de avistamientos aprobados | Público |
| GET | `/api/reportes-avistamiento/pendientes` | Cola de revisión | `ADMINISTRADOR`, `SUPERADMINISTRADOR` |
| POST | `/api/reportes-avistamiento/{id}/aprobar` | Aprobar reporte | `ADMINISTRADOR`, `SUPERADMINISTRADOR` |
| POST | `/api/reportes-avistamiento/{id}/rechazar` | Rechazar reporte | `ADMINISTRADOR`, `SUPERADMINISTRADOR` |

## Autenticación

Los endpoints protegidos requieren un JWT obtenido en `POST /api/autenticacion/iniciar-sesion`, enviado en la cabecera:

```http
Authorization: Bearer <token>
```

El rol y el estado `habilitado` del usuario se leen de la base de datos en cada petición, así que una cuenta inhabilitada
pierde el acceso de inmediato (responde como si no tuviera sesión).

La jerarquía de roles es `SUPERADMINISTRADOR > ADMINISTRADOR`: un superadministrador puede hacer todo lo que hace un
administrador. **Esa jerarquía no incluye a `USUARIO_REGISTRADO`**, por lo que administradores y superadministradores
**no pueden crear reportes** (reciben `403`).

## Ciclo de vida de un reporte

```
           crear (HU-18)
                │
                ▼
          ┌───────────┐  aprobar (HU-19)   ┌──────────┐
          │ PENDIENTE │ ─────────────────► │ APROBADO │ ──► visible en el foro (HU-20)
          └───────────┘                    └──────────┘
                │
                │ rechazar (HU-19)         ┌───────────┐
                └────────────────────────► │ RECHAZADO │ ──► no se publica
                                           └───────────┘
```

Todo reporte nace `PENDIENTE`. Solo un reporte `PENDIENTE` puede aprobarse o rechazarse; una vez revisado su estado es
definitivo.

## Modelos

### `OccurrenceDto` (reporte)

Los nombres de los campos biológicos siguen Darwin Core.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador del reporte |
| `occurrenceRemarks` | string | Descripción del avistamiento (DwC: `occurrenceRemarks`) |
| `kingdom` | enum | Reino (DwC: `kingdom`): `ANIMALIA`, `PLANTAE`, `FUNGI`, `DESCONOCIDO` |
| `vernacularName` | string | Clasificación específica (DwC: `vernacularName`). `"Desconocido"` si no se indicó |
| `decimalLatitude` | number \| null | Latitud del lugar (DwC: `decimalLatitude`) |
| `decimalLongitude` | number \| null | Longitud del lugar (DwC: `decimalLongitude`) |
| `recordedBy` | string | Nombre y apellido del autor (DwC: `recordedBy`). Nunca se expone el correo |
| `urlFoto` | string \| null | URL pública de la foto, o `null` si no tiene |
| `estado` | enum | `PENDIENTE`, `APROBADO` o `RECHAZADO` |
| `fechaCreacion` | string (ISO-8601, UTC) | Fecha de envío |
| `fechaRevision` | string (ISO-8601, UTC) \| null | Fecha de aprobación o rechazo; `null` mientras está pendiente |

### `PageResponse<OccurrenceDto>` (página)

| Campo | Tipo | Descripción |
|---|---|---|
| `contenido` | `OccurrenceDto[]` | Elementos de la página |
| `pagina` | integer | Número de página, empezando en 0 |
| `tamano` | integer | Tamaño de página aplicado |
| `totalElementos` | integer | Total de elementos en todas las páginas |
| `totalPaginas` | integer | Total de páginas |

### `ApiErrorResponse` (error)

Todas las respuestas de error, incluidas las `401` y `403` de Spring Security, usan este formato:

| Campo | Tipo | Descripción |
|---|---|---|
| `fecha` | string (ISO-8601, UTC) | Momento del error |
| `estado` | integer | Código HTTP |
| `error` | string | Nombre del código HTTP |
| `mensaje` | string | Mensaje para mostrar al usuario (en español) |
| `ruta` | string | Ruta solicitada |

```json
{
  "fecha": "2026-10-08T15:30:00Z",
  "estado": 404,
  "error": "Not Found",
  "mensaje": "El reporte solicitado no existe.",
  "ruta": "/api/reportes-avistamiento/0f8e6a1c-3b2d-4c5e-9f10-7a6b5c4d3e2f/aprobar"
}
```

---

## 1. Crear reporte de avistamiento (HU-18)

```http
POST /api/reportes-avistamiento
Content-Type: multipart/form-data
Authorization: Bearer <token de USUARIO_REGISTRADO>
```

Crea un reporte en estado `PENDIENTE`. El autor es siempre el usuario autenticado; no se recibe en el formulario.
Ante un `201` el cliente debe mostrar: *"Tu reporte fue enviado y será revisado por un administrador."*

### Campos del formulario (`multipart/form-data`)

| Campo | Tipo | Obligatorio | Reglas |
|---|---|:-:|---|
| `occurrenceRemarks` | texto | Sí | No vacío, máximo 2000 caracteres. Se guarda sin espacios al inicio ni al final |
| `id` | UUID | No | Id generado por el cliente. Reenviar el mismo id no duplica el reporte (ver *Idempotencia*) |
| `kingdom` | texto | No | `ANIMALIA`, `PLANTAE`, `FUNGI` o `DESCONOCIDO`. Si se omite queda `DESCONOCIDO` |
| `vernacularName` | texto | No | Máximo 150 caracteres. Si se omite o va en blanco queda `"Desconocido"` |
| `decimalLatitude` | decimal | No* | Entre -90 y 90 |
| `decimalLongitude` | decimal | No* | Entre -180 y 180 |
| `foto` | archivo | No | Solo JPG o PNG (se detecta por el contenido, no por la extensión), máximo 10 MB |

\* Las coordenadas son opcionales, pero deben enviarse **las dos juntas** o ninguna.

### Idempotencia

El campo `id` permite reintentar un envío o sincronizar reportes creados sin conexión:

- Si no existe un reporte con ese `id`, se crea y se responde `201 Created`.
- Si ya existe y **es del mismo usuario**, se devuelve el reporte existente sin modificarlo y se responde `200 OK`.
  Los datos del nuevo envío se ignoran (incluida la foto).
- Si ya existe y es **de otro usuario**, se responde `409 Conflict`.
- Si no se envía `id`, el servidor genera uno.

### Ejemplo de request

```bash
curl -X POST http://localhost:8080/api/reportes-avistamiento \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -F "id=0f8e6a1c-3b2d-4c5e-9f10-7a6b5c4d3e2f" \
  -F "occurrenceRemarks=Vi un ave azul comiendo frutos en el borde del humedal" \
  -F "kingdom=ANIMALIA" \
  -F "vernacularName=Azulejo" \
  -F "decimalLatitude=2.459800" \
  -F "decimalLongitude=-76.611500" \
  -F "foto=@ave.jpg;type=image/jpeg"
```

Ejemplo mínimo (solo la descripción):

```bash
curl -X POST http://localhost:8080/api/reportes-avistamiento \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -F "occurrenceRemarks=Escuché un canto que no reconocí cerca del sendero"
```

### Respuesta `201 Created`

```json
{
  "id": "0f8e6a1c-3b2d-4c5e-9f10-7a6b5c4d3e2f",
  "occurrenceRemarks": "Vi un ave azul comiendo frutos en el borde del humedal",
  "kingdom": "ANIMALIA",
  "vernacularName": "Azulejo",
  "decimalLatitude": 2.459800,
  "decimalLongitude": -76.611500,
  "recordedBy": "Ana Gómez",
  "urlFoto": "http://localhost:9000/orquidea/reportes/5b1d2c3e-8a7f-4e6d-9c0b-1a2b3c4d5e6f.jpg",
  "estado": "PENDIENTE",
  "fechaCreacion": "2026-10-08T15:30:00Z",
  "fechaRevision": null
}
```

Respuesta del ejemplo mínimo (sin reino, clasificación, lugar ni foto):

```json
{
  "id": "7c2a9e41-0d3b-4f8a-b6e5-2f1c0a9b8d7e",
  "occurrenceRemarks": "Escuché un canto que no reconocí cerca del sendero",
  "kingdom": "DESCONOCIDO",
  "vernacularName": "Desconocido",
  "decimalLatitude": null,
  "decimalLongitude": null,
  "recordedBy": "Ana Gómez",
  "urlFoto": null,
  "estado": "PENDIENTE",
  "fechaCreacion": "2026-10-08T15:32:10Z",
  "fechaRevision": null
}
```

### Respuesta `200 OK`

Reenvío con un `id` que el mismo usuario ya registró. El cuerpo es el reporte existente, con su estado actual (puede
estar ya `APROBADO` o `RECHAZADO`).

### Errores

| Código | Causa | `mensaje` |
|---|---|---|
| 400 | `occurrenceRemarks` falta o está en blanco | `La descripción es obligatoria.` |
| 400 | `occurrenceRemarks` supera 2000 caracteres | `La descripción no puede superar 2000 caracteres.` |
| 400 | `vernacularName` supera 150 caracteres | `La clasificación no puede superar 150 caracteres.` |
| 400 | Latitud o longitud fuera de rango, o solo se envió una de las dos | `Las coordenadas ingresadas no son válidas.` |
| 400 | Valor no convertible (p. ej. `kingdom=PEZ`, `id=abc`, `decimalLatitude=norte`) | `El valor del campo '<campo>' no es válido.` |
| 400 | La foto no es JPG ni PNG | `El formato de la imagen no es válido.` |
| 401 | Sin token, token inválido o vencido, o cuenta inhabilitada | `Debe iniciar sesión para acceder a este recurso.` |
| 403 | El usuario no tiene rol `USUARIO_REGISTRADO` (incluye administradores) | `No tiene permisos para realizar esta acción.` |
| 409 | Otro usuario ya registró un reporte con ese `id` | `Ya existe un reporte con ese identificador.` |
| 413 | La foto supera 10 MB | `La imagen supera el tamaño máximo permitido de 10 MB.` |
| 415 | El cuerpo no es `multipart/form-data` | `Tipo de contenido no soportado.` |

Si hay varios errores de validación a la vez, solo se informa uno: se priorizan los de las reglas (obligatorio,
longitud, rango) sobre los de conversión de tipo.

Ejemplo `400`:

```json
{
  "fecha": "2026-10-08T15:30:00Z",
  "estado": 400,
  "error": "Bad Request",
  "mensaje": "La descripción es obligatoria.",
  "ruta": "/api/reportes-avistamiento"
}
```

Ejemplo `413`:

```json
{
  "fecha": "2026-10-08T15:30:00Z",
  "estado": 413,
  "error": "Content Too Large",
  "mensaje": "La imagen supera el tamaño máximo permitido de 10 MB.",
  "ruta": "/api/reportes-avistamiento"
}
```

> Si falla el guardado del reporte después de subir la foto, la foto se elimina del almacenamiento automáticamente.

---

## 2. Foro de avistamientos (HU-20)

```http
GET /api/reportes-avistamiento?pagina=0&tamano=20
```

**Público** (no requiere token). Devuelve solo reportes `APROBADO`, ordenados por fecha de revisión, **los más
recientes primero**.

### Parámetros de consulta

| Parámetro | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `pagina` | integer | `0` | Número de página, desde 0. Un valor negativo se trata como 0 |
| `tamano` | integer | `20` | Tamaño de página. Se ajusta al rango 1–50 |

### Ejemplo de request

```bash
curl "http://localhost:8080/api/reportes-avistamiento?pagina=0&tamano=2"
```

### Respuesta `200 OK`

```json
{
  "contenido": [
    {
      "id": "0f8e6a1c-3b2d-4c5e-9f10-7a6b5c4d3e2f",
      "occurrenceRemarks": "Vi un ave azul comiendo frutos en el borde del humedal",
      "kingdom": "ANIMALIA",
      "vernacularName": "Azulejo",
      "decimalLatitude": 2.459800,
      "decimalLongitude": -76.611500,
      "recordedBy": "Ana Gómez",
      "urlFoto": "http://localhost:9000/orquidea/reportes/5b1d2c3e-8a7f-4e6d-9c0b-1a2b3c4d5e6f.jpg",
      "estado": "APROBADO",
      "fechaCreacion": "2026-10-08T15:30:00Z",
      "fechaRevision": "2026-10-09T10:00:00Z"
    },
    {
      "id": "3a4b5c6d-7e8f-4a1b-9c2d-0e1f2a3b4c5d",
      "occurrenceRemarks": "Orquídea blanca creciendo sobre un tronco caído",
      "kingdom": "PLANTAE",
      "vernacularName": "Desconocido",
      "decimalLatitude": null,
      "decimalLongitude": null,
      "recordedBy": "Luis Pérez",
      "urlFoto": null,
      "estado": "APROBADO",
      "fechaCreacion": "2026-10-07T09:12:45Z",
      "fechaRevision": "2026-10-08T18:20:00Z"
    }
  ],
  "pagina": 0,
  "tamano": 2,
  "totalElementos": 5,
  "totalPaginas": 3
}
```

Si no hay reportes aprobados se responde `200` con una página vacía, y el cliente muestra:
*"Aún no hay avistamientos publicados."*

```json
{
  "contenido": [],
  "pagina": 0,
  "tamano": 20,
  "totalElementos": 0,
  "totalPaginas": 0
}
```

### Errores

| Código | Causa | `mensaje` |
|---|---|---|
| 400 | `pagina` o `tamano` no son números enteros | `El valor del parámetro '<parametro>' no es válido.` |

---

## 3. Cola de revisión (HU-19)

```http
GET /api/reportes-avistamiento/pendientes?pagina=0&tamano=20
Authorization: Bearer <token de ADMINISTRADOR o SUPERADMINISTRADOR>
```

Devuelve los reportes `PENDIENTE`, **los más antiguos primero** (por fecha de creación), para revisarlos en orden de
llegada.

### Parámetros de consulta

Los mismos que el foro: `pagina` (por defecto `0`) y `tamano` (por defecto `20`, rango 1–50).

### Ejemplo de request

```bash
curl "http://localhost:8080/api/reportes-avistamiento/pendientes?pagina=0&tamano=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

### Respuesta `200 OK`

```json
{
  "contenido": [
    {
      "id": "7c2a9e41-0d3b-4f8a-b6e5-2f1c0a9b8d7e",
      "occurrenceRemarks": "Escuché un canto que no reconocí cerca del sendero",
      "kingdom": "DESCONOCIDO",
      "vernacularName": "Desconocido",
      "decimalLatitude": null,
      "decimalLongitude": null,
      "recordedBy": "Ana Gómez",
      "urlFoto": null,
      "estado": "PENDIENTE",
      "fechaCreacion": "2026-10-08T15:32:10Z",
      "fechaRevision": null
    }
  ],
  "pagina": 0,
  "tamano": 20,
  "totalElementos": 1,
  "totalPaginas": 1
}
```

### Errores

| Código | Causa | `mensaje` |
|---|---|---|
| 400 | `pagina` o `tamano` no son números enteros | `El valor del parámetro '<parametro>' no es válido.` |
| 401 | Sin token, token inválido o vencido, o cuenta inhabilitada | `Debe iniciar sesión para acceder a este recurso.` |
| 403 | El usuario no es administrador ni superadministrador | `No tiene permisos para realizar esta acción.` |

---

## 4. Aprobar reporte (HU-19)

```http
POST /api/reportes-avistamiento/{id}/aprobar
Authorization: Bearer <token de ADMINISTRADOR o SUPERADMINISTRADOR>
```

Pasa el reporte de `PENDIENTE` a `APROBADO`, registra la fecha de revisión y al administrador que lo revisó, y el
reporte aparece en el foro público. No lleva cuerpo.

### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador del reporte |

### Ejemplo de request

```bash
curl -X POST http://localhost:8080/api/reportes-avistamiento/0f8e6a1c-3b2d-4c5e-9f10-7a6b5c4d3e2f/aprobar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

### Respuesta `200 OK`

```json
{
  "id": "0f8e6a1c-3b2d-4c5e-9f10-7a6b5c4d3e2f",
  "occurrenceRemarks": "Vi un ave azul comiendo frutos en el borde del humedal",
  "kingdom": "ANIMALIA",
  "vernacularName": "Azulejo",
  "decimalLatitude": 2.459800,
  "decimalLongitude": -76.611500,
  "recordedBy": "Ana Gómez",
  "urlFoto": "http://localhost:9000/orquidea/reportes/5b1d2c3e-8a7f-4e6d-9c0b-1a2b3c4d5e6f.jpg",
  "estado": "APROBADO",
  "fechaCreacion": "2026-10-08T15:30:00Z",
  "fechaRevision": "2026-10-09T10:00:00Z"
}
```

### Errores

| Código | Causa | `mensaje` |
|---|---|---|
| 401 | Sin token, token inválido o vencido, o cuenta inhabilitada | `Debe iniciar sesión para acceder a este recurso.` |
| 403 | El usuario no es administrador ni superadministrador | `No tiene permisos para realizar esta acción.` |
| 404 | No existe un reporte con ese `id` | `El reporte solicitado no existe.` |
| 404 | El `id` no es un UUID válido | `El recurso solicitado no existe.` |
| 409 | El reporte ya fue aprobado o rechazado | `El reporte ya fue revisado.` |

Ejemplo `409`:

```json
{
  "fecha": "2026-10-09T10:05:00Z",
  "estado": 409,
  "error": "Conflict",
  "mensaje": "El reporte ya fue revisado.",
  "ruta": "/api/reportes-avistamiento/0f8e6a1c-3b2d-4c5e-9f10-7a6b5c4d3e2f/aprobar"
}
```

---

## 5. Rechazar reporte (HU-19)

```http
POST /api/reportes-avistamiento/{id}/rechazar
Authorization: Bearer <token de ADMINISTRADOR o SUPERADMINISTRADOR>
```

Pasa el reporte de `PENDIENTE` a `RECHAZADO`, registra la fecha de revisión y al administrador que lo revisó. El
reporte sale de la cola de revisión y nunca se publica en el foro. No lleva cuerpo.

### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador del reporte |

### Ejemplo de request

```bash
curl -X POST http://localhost:8080/api/reportes-avistamiento/7c2a9e41-0d3b-4f8a-b6e5-2f1c0a9b8d7e/rechazar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

### Respuesta `200 OK`

```json
{
  "id": "7c2a9e41-0d3b-4f8a-b6e5-2f1c0a9b8d7e",
  "occurrenceRemarks": "Escuché un canto que no reconocí cerca del sendero",
  "kingdom": "DESCONOCIDO",
  "vernacularName": "Desconocido",
  "decimalLatitude": null,
  "decimalLongitude": null,
  "recordedBy": "Ana Gómez",
  "urlFoto": null,
  "estado": "RECHAZADO",
  "fechaCreacion": "2026-10-08T15:32:10Z",
  "fechaRevision": "2026-10-09T10:10:00Z"
}
```

### Errores

Los mismos que **Aprobar reporte**: `401`, `403`, `404` y `409` (`El reporte ya fue revisado.`).

---

## Errores generales

Además de los errores propios de cada endpoint, cualquier petición puede recibir los siguientes. La seguridad se
evalúa primero: en una ruta que no es pública, una petición sin sesión recibe `401` antes que cualquiera de estos.

| Código | Causa | `mensaje` |
|---|---|---|
| 404 | Ruta inexistente | `El recurso solicitado no existe.` |
| 405 | Método HTTP no soportado en la ruta (p. ej. `DELETE /api/reportes-avistamiento`) | `Método HTTP no permitido para este recurso.` |
| 409 | Conflicto de integridad en la base de datos (p. ej. dos envíos simultáneos con el mismo `id`) | `El registro entra en conflicto con uno existente.` |
| 500 | Error no controlado (p. ej. fallo del almacenamiento de fotos) | `Ocurrió un error inesperado. Intente de nuevo más tarde.` |
