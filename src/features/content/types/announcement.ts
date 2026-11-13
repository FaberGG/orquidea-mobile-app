/** Nivel de prioridad de un anuncio (HU-16 CA3). */
export type AnnouncementPriority = 'high' | 'medium' | 'low';

/** Datos para publicar un anuncio o contenido educativo (HU-16 y HU-23). */
export type AnnouncementInput = {
  title: string;
  description: string;
  priority: AnnouncementPriority;
  /** Fecha y hora de finalización (HU-23). `null`: el anuncio no se vence. */
  expiresAt: Date | null;
};

/** Cómo ve el administrador un anuncio (HU-24): visible, oculto por un admin o vencido (HU-23). */
export type AnnouncementVisibility = 'visible' | 'hidden' | 'expired';

/** Modelo de lectura de HU-17, independiente de los nombres del contrato en español. */
export type Announcement = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  expiresAt: string | null;
  publisherName: string | null;
  priority: AnnouncementPriority;
};

/** Anuncio como lo ve el administrador (HU-24): el mismo de HU-17 más su estado. */
export type AdminAnnouncement = Announcement & {
  visibility: AnnouncementVisibility;
};

/** Elemento de la lista unificada (SCRUM-71): solo trae `visibility` si quien mira gestiona anuncios. */
export type ListedAnnouncement = Announcement & {
  visibility?: AnnouncementVisibility;
};

/**
 * Cambios al editar un anuncio (SCRUM-71). Solo se incluye lo que cambió: la API conserva el resto.
 * No hay forma de quitar la fecha de finalización (la API ignora los campos vacíos).
 */
export type AnnouncementChanges = Partial<{
  title: string;
  description: string;
  priority: AnnouncementPriority;
  expiresAt: Date;
}>;
