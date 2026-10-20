# src/features/species/api/

**Responsabilidad:** llamadas a los endpoints de fichas taxonómicas mediante `@/lib/api`, con traducción
DTO ⇄ `Species`. Contrato: [`docs/api/`](../../../../docs/api/README.md).

| Archivo | Función | Endpoint | HU | Estado |
|---|---|---|---|---|
| `species.api.ts` | `listSpecies(category)` | `GET /api/fichas-taxonomicas?categoria=AVE\|PLANTA\|INSECTO` (sin `categoria` con *Todos*) | HU-10 | ✅ |
| `species.api.ts` | `getSpecies(id)` | `GET /api/fichas-taxonomicas/{id}` | HU-10 | ✅ |
| — | `createSpecies(input)` | `POST /api/fichas-taxonomicas` (`multipart/form-data`) | HU-7 | Pendiente |
| — | `updateSpecies(id, input)` | `PUT /api/fichas-taxonomicas/{id}` | HU-8 | Pendiente |
| — | `deleteSpecies(id)` | ⛔ No existe en la API (brecha B1) | HU-9 | Bloqueada |

Listado y detalle son públicos: se llaman con `authenticated: false`. Un `404` en el detalle significa que la
ficha no existe.

`getSpecies` admite opcionalmente `signal` y `timeoutMs` para cancelar una lectura al abandonar el
flujo QR y limitarla a 10 segundos. El contrato de listado y el comportamiento actual del detalle se
mantienen sin cambios para sus llamadores.

`species.mappers.ts` valida la respuesta con `schemas/species-dto.schema.ts` y la traduce a `Species`.

`getSpeciesQr(id, signal?)` obtiene `GET /api/fichas-taxonomicas/{id}/qr` autenticado, solicita PNG y
comprueba la firma binaria completa antes de devolver los bytes. Solo administrador/superadministrador
pueden descargarlo. La URL de la API y el token nunca forman parte del contenido QR ni del archivo.

## Traducción de campos

| API (`TaxonDto`) | App (`Species`) |
|---|---|
| `categoria: AVE \| PLANTA \| INSECTO` | `category: bird \| plant \| insect` |
| `order`, `family`, `genus`, `scientificName`, `vernacularName` | Mismo nombre |
| `alimentacion`, `rolEnHumedal` | `diet`, `wetlandRole` |
| `estadoConservacion` (UICN: `EX`…`NE`) | `conservationStatus` (mismos códigos) |
| `urlFoto` | `photoUrl` |

La API no envía **reino, filo y clase**: la sección de taxonomía del Figma muestra solo orden, familia,
género y especie.

## Errores

| Estado | Caso |
|---|---|
| 400 | Parámetros inválidos (categoría fuera de la lista) |
| 404 | La ficha no existe |
