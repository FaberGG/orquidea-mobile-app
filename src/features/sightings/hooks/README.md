# src/features/sightings/hooks/

**Responsabilidad:** estado de servidor de los reportes (TanStack Query).

| Hook | Descripción | Caché |
|---|---|---|
| `useApprovedSightings()` | Foro (HU-20), scroll infinito de 10 en 10; `data` es la lista ya aplanada | `sightingsKeys.approved()` |
| `usePendingSightings()` | Cola de revisión (HU-19), mismo paginado | `sightingsKeys.pending()` |
| `useCreateSighting()` | Envía el reporte (HU-18); invalida la cola | — |
| `useReviewSighting()` | Aprueba o rechaza (HU-19); invalida foro y cola | — |
| `getCreateSightingErrorMessage(error)` / `getReviewSightingErrorMessage(error)` | Mensaje del servidor o respaldo local (CODIGO §10) | — |
