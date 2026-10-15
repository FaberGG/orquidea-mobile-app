import { useQuery } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

import { listAnnouncements } from '../api';
import { announcementKeys, CONTENT_MESSAGES } from '../constants';

/** HU-17: consulta pública; compartir la clave permite que HU-16 refresque el listado. */
export function useAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.list(),
    queryFn: ({ signal }) => listAnnouncements(signal),
  });
}

/** Mensaje de lectura: nunca confunde un fallo del servidor con una lista vacía. */
export function getAnnouncementsErrorMessage(error: unknown): string {
  if (!isApiError(error)) return CONTENT_MESSAGES.unexpectedError;
  if (error.kind !== 'http') return CONTENT_MESSAGES.networkError;
  if (error.status >= 400 && error.status < 500 && error.serverMessage) {
    return error.serverMessage;
  }
  return CONTENT_MESSAGES.announcementsLoadError;
}
