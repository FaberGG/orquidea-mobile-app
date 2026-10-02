# src/types/ — Tipos globales

**Responsabilidad:** tipos compartidos por varias capas que no pertenecen a un dominio concreto.

| Archivo previsto | Contenido |
|---|---|
| `api.ts` | `Paginated<T>`, `ApiErrorBody` y otras formas genéricas de respuesta de la API |
| `utility.ts` | Utilidades de tipos (`Nullable<T>`, etc.) si se necesitan |

## Reglas

- Los modelos de dominio (`Species`, `User`, `Admin`) viven en `features/<feature>/types/`.
- `Role` y `Permission` viven en `@/permissions`.
- Si en el futuro se generan tipos desde el OpenAPI del backend, irán en `types/generated/` (no editar a mano).
