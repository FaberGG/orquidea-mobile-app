/**
 * Mensajes de HE-06. Los de los criterios de aceptación se copian textualmente de
 * docs/requirements/Historias-Usuario.md; no reescribirlos.
 */
export const CONTENT_MESSAGES = {
  // HU-16 CA2
  announcementRequiredFields: 'Debes completar el título y el contenido del anuncio.',
  // HU-16 CA1 (la HU no define texto: confirmación local)
  announcementPublished: 'El anuncio se publicó correctamente.',
  // Respaldo local (CODIGO §10)
  networkError: 'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  forbidden: 'No tienes permisos para publicar anuncios.',
  unexpectedError: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
} as const;

/** Textos de la interfaz de HE-06. */
export const CONTENT_LABELS = {
  publishTitle: 'Publicar anuncio',
  publishSubtitle:
    'Comparte un anuncio o información educativa con todos los visitantes del humedal.',
  back: 'Volver',
  titleLabel: 'Título',
  titlePlaceholder: 'Ej.: Jornada de avistamiento de aves',
  descriptionLabel: 'Contenido',
  descriptionPlaceholder: 'Escribe el anuncio o la información educativa',
  // HU-16 CA1 y CA2: "Clic en el botón PUBLICAR."
  publishButton: 'PUBLICAR',
} as const;

/** Límites de longitud del formulario (provisionales hasta que el contrato los defina). */
export const ANNOUNCEMENT_LIMITS = {
  titleMaxLength: 120,
  descriptionMaxLength: 2000,
} as const;

/** Claves de caché de la feature (HU-17 lista los anuncios con `announcementKeys.list()`). */
export const announcementKeys = {
  all: ['announcements'] as const,
  list: () => [...announcementKeys.all, 'list'] as const,
};
