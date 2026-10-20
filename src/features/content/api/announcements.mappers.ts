import { announcementListDtoSchema } from '../schemas';
import { type Announcement } from '../types';

/** Valida y traduce la respuesta de `GET /api/anuncios` al modelo de pantalla. */
export function toAnnouncementList(response: unknown): Announcement[] {
  return announcementListDtoSchema.parse(response).map((dto) => ({
    id: dto.id,
    title: dto.titulo,
    description: dto.descripcion,
    publishedAt: dto.fechaCreacion,
  }));
}
