import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

import { createAnnouncement } from '../api';
import { announcementKeys, CONTENT_MESSAGES } from '../constants';
import { type AnnouncementInput } from '../types';

/** HU-16: publica el anuncio y refresca el listado público (HU-17). */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AnnouncementInput) => createAnnouncement(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: announcementKeys.all }),
  });
}

/**
 * Mensaje cuando falla la publicación (CODIGO §10): `mensaje` del servidor en 4xx; si falta, el del
 * criterio de aceptación para 400; respaldos locales para permisos, red y errores inesperados.
 */
export function getPublishAnnouncementErrorMessage(error: unknown): string {
  if (!isApiError(error)) return CONTENT_MESSAGES.unexpectedError;
  if (error.kind !== 'http') return CONTENT_MESSAGES.networkError;
  if (error.status >= 400 && error.status < 500) {
    if (error.serverMessage) return error.serverMessage;
    if (error.status === 400) return CONTENT_MESSAGES.announcementRequiredFields;
    if (error.status === 403) return CONTENT_MESSAGES.forbidden;
  }
  return CONTENT_MESSAGES.unexpectedError;
}
