import { apiClient } from '@/lib/api';

import {
  type Announcement,
  type AnnouncementInput,
  type CreateAnnouncementRequestDto,
} from '../types';
import { toAnnouncementList } from './announcements.mappers';

const ANNOUNCEMENTS_PATH = '/api/anuncios';

/** Traduce el formulario al cuerpo que espera la API (campos en español). */
export function toCreateAnnouncementDto({
  title,
  description,
}: AnnouncementInput): CreateAnnouncementRequestDto {
  return { titulo: title.trim(), descripcion: description.trim() };
}

/**
 * HU-16: `POST /api/anuncios`. Solo administrador y superadministrador (la API lo valida).
 * La respuesta no se usa: basta con saber si la publicación funcionó.
 */
export async function createAnnouncement(input: AnnouncementInput): Promise<void> {
  await apiClient.post<unknown>(ANNOUNCEMENTS_PATH, { body: toCreateAnnouncementDto(input) });
}

/** HU-17: obtiene el listado público más reciente primero, sin adjuntar credenciales. */
export async function listAnnouncements(signal?: AbortSignal): Promise<Announcement[]> {
  const response = await apiClient.get<unknown>(ANNOUNCEMENTS_PATH, {
    authenticated: false,
    signal,
  });
  return toAnnouncementList(response);
}
