import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

import { createSighting, reviewSighting } from '../api';
import { SIGHTINGS_MESSAGES, sightingsKeys } from '../constants';
import { type SightingInput } from '../types';

/** HU-18: envía el reporte. Nace pendiente, así que el foro no cambia; la cola de revisión sí. */
export function useCreateSighting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SightingInput) => createSighting(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sightingsKeys.pending() }),
  });
}

export type ReviewDecision = 'approve' | 'reject';

/** HU-19: aprueba o rechaza un reporte. Cambia la cola y, si se aprueba, el foro. */
export function useReviewSighting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: ReviewDecision }) =>
      reviewSighting(id, decision),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sightingsKeys.all }),
  });
}

/**
 * Mensaje para un fallo al enviar el reporte. Se prefiere el `mensaje` del servidor (400, 403, 413);
 * los textos locales son respaldo (CODIGO §10).
 */
export function getCreateSightingErrorMessage(error: unknown): string {
  if (isApiError(error) && error.serverMessage) return error.serverMessage;
  if (isApiError(error) && error.status === 413) return SIGHTINGS_MESSAGES.imageTooLarge;
  return SIGHTINGS_MESSAGES.saveError;
}

/** Mensaje para un fallo al revisar (p. ej. `409`: "El reporte ya fue revisado."). */
export function getReviewSightingErrorMessage(error: unknown): string {
  if (isApiError(error) && error.serverMessage) return error.serverMessage;
  return SIGHTINGS_MESSAGES.reviewError;
}
