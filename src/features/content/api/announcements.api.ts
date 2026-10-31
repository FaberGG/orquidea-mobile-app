import { apiClient } from '@/lib/api';

import { ANNOUNCEMENT_PRIORITY_OPTIONS } from '../constants';
import {
  type Announcement,
  type AnnouncementInput,
  type AnnouncementPriority,
  type AnnouncementPriorityDto,
  type CreateAnnouncementRequestDto,
} from '../types';
import { toAnnouncementList } from './announcements.mappers';

const ANNOUNCEMENTS_PATH = '/api/anuncios';

function toPriorityDto(priority: AnnouncementPriority): AnnouncementPriorityDto {
  const option = ANNOUNCEMENT_PRIORITY_OPTIONS.find((item) => item.id === priority);
  if (!option) throw new Error(`Prioridad desconocida: ${priority}`);
  return option.apiValue;
}

/**
 * Traduce el formulario al cuerpo que espera la API (campos en español). La fecha de finalización
 * viaja como instante ISO en UTC y se omite si el anuncio no se vence (HU-23 CA2).
 */
export function toCreateAnnouncementDto({
  title,
  description,
  priority,
  expiresAt,
}: AnnouncementInput): CreateAnnouncementRequestDto {
  return {
    titulo: title.trim(),
    descripcion: description.trim(),
    prioridad: toPriorityDto(priority),
    ...(expiresAt ? { fechaExpiracion: expiresAt.toISOString() } : {}),
  };
}

/**
 * HU-16 y HU-23: `POST /api/anuncios`. Solo administrador y superadministrador (la API lo valida).
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
