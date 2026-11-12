import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

import { listAdminAnnouncements, listAnnouncements } from '../api';
import { announcementKeys, CONTENT_MESSAGES } from '../constants';
import { type ListedAnnouncement } from '../types';

/** HU-17: consulta pública; compartir la clave permite que HU-16 refresque el listado. */
export function useAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.list(),
    queryFn: ({ signal }) => listAnnouncements(signal),
  });
}

/**
 * SCRUM-71: la lista unificada. Quien gestiona anuncios (`announcements:manage`) recibe todos, también
 * ocultos y vencidos, con su estado; los demás, solo los visibles y vigentes de HU-17. Solo se consulta
 * la lista que corresponde: la otra queda deshabilitada.
 */
export function useAnnouncementList(canManage: boolean): UseQueryResult<ListedAnnouncement[]> {
  const publicList = useQuery({
    queryKey: announcementKeys.list(),
    queryFn: ({ signal }) => listAnnouncements(signal),
    enabled: !canManage,
  });
  const adminList = useQuery({
    queryKey: announcementKeys.admin(),
    queryFn: ({ signal }) => listAdminAnnouncements(signal),
    enabled: canManage,
  });
  return canManage ? adminList : publicList;
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
