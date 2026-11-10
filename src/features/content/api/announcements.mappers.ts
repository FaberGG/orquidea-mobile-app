import { ANNOUNCEMENT_PRIORITY_OPTIONS } from '../constants';
import { adminAnnouncementListDtoSchema, announcementListDtoSchema } from '../schemas';
import {
  type AdminAnnouncement,
  type Announcement,
  type AnnouncementPriority,
  type AnnouncementVisibility,
} from '../types';

function toPriority(apiValue: 'ALTA' | 'MEDIA' | 'BAJA'): AnnouncementPriority {
  const option = ANNOUNCEMENT_PRIORITY_OPTIONS.find((item) => item.apiValue === apiValue);
  if (!option) throw new Error(`Prioridad desconocida: ${apiValue}`);
  return option.id;
}

/** Valida y traduce la respuesta de `GET /api/anuncios` al modelo de pantalla. */
export function toAnnouncementList(response: unknown): Announcement[] {
  return announcementListDtoSchema.parse(response).map((dto) => ({
    id: dto.id,
    title: dto.titulo,
    description: dto.descripcion,
    publishedAt: dto.fechaCreacion,
    expiresAt: dto.fechaExpiracion ?? null,
    publisherName: dto.nombrePublicador?.trim() || null,
    priority: toPriority(dto.prioridad),
  }));
}

/**
 * Estado que ve el administrador (HU-24): vencido gana sobre oculto, porque un anuncio vencido no se
 * puede volver a mostrar (la API responde 409).
 */
function toVisibility(estado: 'ACTIVO' | 'INACTIVO', expirado: boolean): AnnouncementVisibility {
  if (expirado) return 'expired';
  return estado === 'INACTIVO' ? 'hidden' : 'visible';
}

/** Valida y traduce `GET /api/anuncios/administracion` (HU-24). */
export function toAdminAnnouncementList(response: unknown): AdminAnnouncement[] {
  return adminAnnouncementListDtoSchema.parse(response).map((dto) => ({
    id: dto.id,
    title: dto.titulo,
    description: dto.descripcion,
    publishedAt: dto.fechaCreacion,
    priority: toPriority(dto.prioridad),
    expiresAt: dto.fechaExpiracion ?? null,
    publisherName: dto.nombrePublicador?.trim() || null,
    visibility: toVisibility(dto.estado, dto.expirado),
  }));
}
