// Forma del JSON de la API. Solo se usa en ../api.
// Pendiente del contrato en docs/api/openapi.json: nombres confirmados con el backend (Santiago) por chat.

export type AnnouncementPriorityDto = 'ALTA' | 'MEDIA' | 'BAJA';

/** Cuerpo de `POST /api/anuncios` (back: AnnouncementRequest). */
export type CreateAnnouncementRequestDto = {
  titulo: string;
  descripcion: string;
  prioridad: AnnouncementPriorityDto;
  /** Instante ISO 8601 en UTC; se omite si el anuncio no se vence. */
  fechaExpiracion?: string;
};

/** Forma de un elemento devuelto por `GET /api/anuncios`. */
export type AnnouncementResponseDto = {
  id: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  prioridad: AnnouncementPriorityDto;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaExpiracion: string | null;
  expirado: boolean;
  /** Pendiente del backend: nombre público del usuario que creó el anuncio. */
  nombrePublicador?: string | null;
};
