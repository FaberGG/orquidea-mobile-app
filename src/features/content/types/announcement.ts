/** Datos para publicar un anuncio o contenido educativo (HU-16). */
export type AnnouncementInput = {
  title: string;
  description: string;
};

/** Modelo de lectura de HU-17, independiente de los nombres del contrato en español. */
export type Announcement = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
};
