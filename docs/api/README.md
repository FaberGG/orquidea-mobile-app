# docs/api/ — Contrato de la API

**Responsabilidad:** guardar el contrato de la API REST que consume la app y documentar cómo se interpreta
desde el cliente.

| Archivo | Contenido |
|---|---|
| [`openapi.json`](openapi.json) | Especificación OpenAPI 3.1 generada por el backend (Springdoc). **No se edita a mano**: se reemplaza con cada exportación. Está excluido de Prettier |

Para explorarlo de forma visual: abrirlo en <https://editor.swagger.io> o usar la extensión *OpenAPI* de VS Code.

---

## 1. Generalidades

| Aspecto | Valor |
|---|---|
| URL base (desarrollo) | `http://localhost:8080`; las rutas ya incluyen `/api` |
| Autenticación | `Authorization: Bearer <JWT>` |
| Duración del token | `expiraEnSegundos` en la respuesta del login (ejemplo: 28800 s = 8 h) |
| Renovación de token | **No existe.** Al vencer, la API responde `401` y la app cierra la sesión |
| Cierre de sesión | **No existe endpoint.** Se cierra la sesión borrando el token del dispositivo |
| Idioma de los campos | Español, salvo los campos taxonómicos Darwin Core (`order`, `family`, `genus`, `scientificName`, `vernacularName`) |

## 2. Endpoints por historia (Sprint 1)

| Método y ruta | Auth | HU | Respuestas |
|---|---|---|---|
| `POST /api/autenticacion/iniciar-sesion` | — | HU-1 | 200 `LoginResponse` · 400 · 401 |
| `GET /api/autenticacion/yo` | JWT | HU-1 (restaurar sesión) | 200 `AuthenticatedUserDto` · 401 |
| `POST /api/autenticacion/recuperar-contrasena` | — | HU-1.1 paso 1: envía código de 6 dígitos | 204 · 400 |
| `POST /api/autenticacion/restablecer-contrasena` | — | HU-1.1 paso 2: correo + código + nueva contraseña | 204 · 400 (código incorrecto o vencido) |
| `POST /api/autenticacion/registro` | — | HU-2 | 201 `RegisterResponse` · 400 · 409 |
| `POST /api/administradores/registrarAdmin` | Superadmin | HU-4 | 201 `RegisterResponse` · 400 · 401 · 403 · 409 |
| `PUT /api/administradores/{id}` | Superadmin | HU-5 (editar / inhabilitar con `habilitado`) | 200 `AdministratorDto` · 400 · 401 · 403 · 404 · 409 |
| `POST /api/administradores/{id}/revocar-acceso` | Superadmin | HU-5 (revocar) | 200 `AdministratorDto` · 401 · 403 · 404 · 409 |
| `GET /api/fichas-taxonomicas?categoria=` | — | HU-10 | 200 `TaxonDto[]` (sin paginación) · 400 |
| `GET /api/fichas-taxonomicas/{id}` | — | HU-10 (detalle) | 200 `TaxonDto` · 404 |
| `POST /api/fichas-taxonomicas` | Admin | HU-7 (`multipart/form-data`) | 201 `TaxonDto` · 400 · 401 · 403 · 409 · 413 |
| `PUT /api/fichas-taxonomicas/{id}` | Admin | HU-8 (`multipart/form-data`, foto opcional) | 200 `TaxonDto` · 400 · 401 · 403 · 404 · 409 · 413 |

## 3. Traducción contrato → app

Los DTO se traducen a modelos de la app en la carpeta `api/` de cada feature
([ARQUITECTURA §4](../architecture/ARQUITECTURA.md#4-flujo-de-datos)).

| API | App |
|---|---|
| `rol: USUARIO_REGISTRADO` / `ADMINISTRADOR` / `SUPERADMINISTRADOR` | `Role`: `user` / `admin` / `superadmin` (sin sesión: `visitor`) |
| `categoria: AVE` / `PLANTA` / `INSECTO` | `SpeciesCategory`: `bird` / `plant` / `insect` |
| `estadoConservacion: EX, EW, CR, EN, VU, NT, LC, DD, NE` (UICN) | `ConservationStatus` con los mismos códigos; etiquetas en español en la UI |
| `nombre`, `apellido`, `correo`, `contrasena` | `firstName`, `lastName`, `email`, `password` |
| `order`, `family`, `genus`, `scientificName`, `vernacularName` | Mismo nombre |
| `alimentacion`, `rolEnHumedal`, `urlFoto`, `habilitado` | `diet`, `wetlandRole`, `photoUrl`, `isEnabled` |

## 4. Errores

Las respuestas de error usan `ApiErrorResponse`:

```json
{ "fecha": "…", "estado": 401, "error": "Unauthorized", "mensaje": "Correo o contraseña incorrectos.", "ruta": "/api/…" }
```

- `mensaje` está pensado para mostrarse al usuario y coincide con los textos de los criterios de aceptación.
- **No hay código de error de negocio**: los casos se distinguen solo por el estado HTTP y el endpoint.
- Regla de la app: ver [CODIGO §10](../conventions/CODIGO.md#10-errores).

Mensajes que el contrato agrega y que no están en las historias:

| Endpoint | Estado | Mensaje |
|---|---|---|
| Crear / editar ficha | 409 | Ya existe una ficha con ese nombre científico |
| Crear / editar ficha | 413 | La imagen supera el tamaño máximo (10 MB) |
| Restablecer contraseña | 400 | Código incorrecto o vencido |

## 5. Brechas con las historias de usuario

Pendientes de resolver con el equipo de backend / Product Owner:

| # | Brecha | Impacto |
|---|---|---|
| B1 | No existe `DELETE /api/fichas-taxonomicas/{id}` | **HU-9 bloqueada** |
| B2 | No existen `GET /api/administradores` ni `GET /api/administradores/{id}` | **HU-5 bloqueada en parte**: no hay listado ni detalle de los administradores que se van a editar o revocar |
| B3 | `registrarAdmin` no documenta el error de "límite de administradores alcanzado" (HU-4 CA2) | No se sabe qué estado devuelve; si también es 409, solo se distingue por `mensaje` |
| B4 | Los endpoints de administradores declaran sus errores con `ApiResponse` (esquema vacío) en lugar de `ApiErrorResponse` | Confirmar que en la práctica devuelven `ApiErrorResponse` |
| B5 | HU-1.1 dice "correo con instrucciones", pero la API usa un **código de 6 dígitos** que se ingresa en la app | Alinear el texto de la HU con el Product Owner; la app implementa el flujo de dos pasos |
| B6 | Campos con nombres en dos idiomas (Darwin Core en inglés, el resto en español) | Sin impacto funcional; decisión del backend |
| B7 | `TaxonRequest` / `TaxonDto` no tienen **reino, filo (división) y clase**, que el diseño de Crear y Editar ficha muestra como taxonomía | El formulario y el detalle solo piden y muestran orden, familia y género. Falta decidir si el backend los agrega (y si son obligatorios) |
| B8 | `categoria` solo acepta `AVE`, `PLANTA` e `INSECTO`; el diseño trae también **Mamíferos, Reptiles y Anfibios** | Esos chips de filtro y la opción "Grupo taxonómico" de Editar no se implementan. Las fichas de esas especies no se pueden registrar |
| B9 | No hay búsqueda de fichas (ni por nombre) | Se omite el buscador del encabezado hasta que exista el endpoint |
| B10 | No hay fuente de autocompletado por nombre científico (el diseño muestra sugerencias y "Auto" en la taxonomía) | Los campos de taxonomía se llenan a mano. Requiere un endpoint o un servicio externo de taxonomía, a decidir |
| B11 | No se clasifica el **rol de cada especie en el humedal** (`rolEnHumedal` es texto libre) | Se muestra solo como texto en el detalle y el formulario |
| B12 | El diseño ofrece **quitar foto** al editar; la API conserva la actual si no se envía una nueva | No hay forma de quitar la foto de una ficha |

Al resolver una brecha, actualizar esta tabla y el [plan del sprint](../sprints/sprint-01.md).
