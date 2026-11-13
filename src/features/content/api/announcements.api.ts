import { apiClient } from '@/lib/api';

import { ANNOUNCEMENT_PRIORITY_OPTIONS } from '../constants';
import {
  type AdminAnnouncement,
  type Announcement,
  type AnnouncementChanges,
  type AnnouncementInput,
  type AnnouncementPriority,
  type AnnouncementPriorityDto,
  type CreateAnnouncementRequestDto,
  type UpdateAnnouncementRequestDto,
} from '../types';
import { toAdminAnnouncementList, toAnnouncementList } from './announcements.mappers';

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

/** HU-24: `GET /api/anuncios/administracion`. Todos los anuncios, también ocultos y vencidos. */
export async function listAdminAnnouncements(signal?: AbortSignal): Promise<AdminAnnouncement[]> {
  const response = await apiClient.get<unknown>(`${ANNOUNCEMENTS_PATH}/administracion`, { signal });
  return toAdminAnnouncementList(response);
}

/** HU-24 CA1: `PATCH /api/anuncios/{id}/ocultar`. Deja de verse para los visitantes. */
export async function hideAnnouncement(id: string): Promise<void> {
  await apiClient.patch<unknown>(`${ANNOUNCEMENTS_PATH}/${encodeURIComponent(id)}/ocultar`);
}

/** HU-24 CA2: `PATCH /api/anuncios/{id}/mostrar`. `409` si el anuncio ya expiró. */
export async function showAnnouncement(id: string): Promise<void> {
  await apiClient.patch<unknown>(`${ANNOUNCEMENTS_PATH}/${encodeURIComponent(id)}/mostrar`);
}

/** Traduce los cambios de la edición al cuerpo de la API; los campos sin cambios no se envían. */
export function toUpdateAnnouncementDto({
  title,
  description,
  priority,
  expiresAt,
}: AnnouncementChanges): UpdateAnnouncementRequestDto {
  return {
    ...(title !== undefined ? { titulo: title.trim() } : {}),
    ...(description !== undefined ? { descripcion: description.trim() } : {}),
    ...(priority !== undefined ? { prioridad: toPriorityDto(priority) } : {}),
    ...(expiresAt !== undefined ? { fechaExpiracion: expiresAt.toISOString() } : {}),
  };
}

/**
 * SCRUM-71: `PATCH /api/anuncios/{id}/actualizar`. Solo cambia los campos enviados; una fecha de
 * finalización pasada responde `400`. El estado (oculto o visible) no se cambia aquí.
 */
export async function updateAnnouncement(id: string, changes: AnnouncementChanges): Promise<void> {
  await apiClient.patch<unknown>(`${ANNOUNCEMENTS_PATH}/${encodeURIComponent(id)}/actualizar`, {
    body: toUpdateAnnouncementDto(changes),
  });
}
