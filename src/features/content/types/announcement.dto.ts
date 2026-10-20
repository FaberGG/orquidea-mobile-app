// Forma del JSON de la API. Solo se usa en ../api.
// Pendiente del contrato en docs/api/openapi.json: nombres confirmados con el backend (Santiago) por chat.

export type CreateAnnouncementRequestDto = {
  titulo: string;
  descripcion: string;
};

/** Forma de un elemento devuelto por `GET /api/anuncios`. */
export type AnnouncementResponseDto = {
  id: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
};
