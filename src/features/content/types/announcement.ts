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

/** Anuncio en la vista del administrador (HU-24). */
export type AdminAnnouncement = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  priority: AnnouncementPriority;
  /** Fecha ISO de finalización, o `null` si no se vence. */
  expiresAt: string | null;
  visibility: AnnouncementVisibility;
};

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
