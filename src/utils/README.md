# src/utils/ — Funciones puras

**Responsabilidad:** funciones pequeñas, puras y sin dependencias de React ni del dominio.

| Archivo previsto | Contenido |
|---|---|
| `format.ts` | Formato de nombres, textos, fechas (`formatDate`) |
| `file.ts` | Utilidades de archivos (extensión, tipo MIME) usadas al validar imágenes |
| `string.ts` | Normalización (trim, minúsculas de correo) |

## Reglas

- Sin efectos secundarios ni estado. Misma entrada → misma salida.
- Cada función tiene pruebas unitarias.
- Si una función solo la usa una feature, vive en esa feature.
