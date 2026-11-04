import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

import { hideAnnouncement, listAdminAnnouncements, showAnnouncement } from '../api';
import { announcementKeys, CONTENT_MESSAGES } from '../constants';

/** HU-24: todos los anuncios con su estado (solo administrador y superadministrador). */
export function useAdminAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.admin(),
    queryFn: ({ signal }) => listAdminAnnouncements(signal),
  });
}

type VisibilityChange = { id: string; action: 'hide' | 'show' };

/**
 * HU-24: ocultar (CA1) o volver a mostrar (CA2) un anuncio. Al terminar se refrescan la vista del
 * administrador y la lista pública (HU-17), que comparten `announcementKeys.all`.
 */
export function useChangeAnnouncementVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: VisibilityChange) =>
      action === 'hide' ? hideAnnouncement(id) : showAnnouncement(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: announcementKeys.all }),
  });
}

/** Mensaje si falla ocultar o mostrar: el del servidor en 4xx; respaldos locales (CODIGO §10). */
export function getAnnouncementVisibilityErrorMessage(error: unknown): string {
  if (!isApiError(error)) return CONTENT_MESSAGES.unexpectedError;
  if (error.kind !== 'http') return CONTENT_MESSAGES.networkError;
  if (error.status >= 400 && error.status < 500 && error.serverMessage) return error.serverMessage;
  if (error.status === 403) return CONTENT_MESSAGES.announcementsManageForbidden;
  if (error.status === 404) return CONTENT_MESSAGES.announcementNotFound;
  if (error.status === 409) return CONTENT_MESSAGES.announcementExpiredCannotShow;
  return CONTENT_MESSAGES.unexpectedError;
}
