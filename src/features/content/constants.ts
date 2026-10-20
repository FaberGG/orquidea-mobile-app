/**
 * Mensajes de HE-06. Los de los criterios de aceptación se copian textualmente de
 * docs/requirements/Historias-Usuario.md; no reescribirlos.
 */
export const CONTENT_MESSAGES = {
  // HU-16 CA2
  announcementRequiredFields: 'Debes completar el título y el contenido del anuncio.',
  // HU-16 CA1 (la HU no define texto: confirmación local)
  announcementPublished: 'El anuncio se publicó correctamente.',
  // HU-17 CA2
  announcementsEmpty: 'Aún no hay anuncios publicados.',
  announcementsLoadError:
    'No pudimos cargar los anuncios. Revisa tu conexión e inténtalo de nuevo.',
  announcementsRefreshError: 'No pudimos actualizar los anuncios. Inténtalo de nuevo.',
  // Respaldo local (CODIGO §10)
  networkError: 'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  forbidden: 'No tienes permisos para publicar anuncios.',
  unexpectedError: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  // HU-14 CA2
  componentWithoutContent: 'La información de esta sección estará disponible próximamente.',
  // HU-15 CA1
  componentUpdated: 'El contenido del componente se actualizó correctamente.',
  // HU-15: validaciones locales (la HU no define textos)
  componentRequiredFields: 'Debes completar el nombre y la descripción del componente.',
  // Mismo texto que devuelve la API con 400 (formato distinto de jpg o png)
  photoInvalidFormat: 'El formato de la imagen no es válido.',
  photoTooLarge: 'La imagen supera el tamaño máximo de 10 MB.',
  photoLimitReached: 'Puedes tener máximo 10 fotos por componente.',
  componentForbidden: 'No tienes permisos para editar este componente.',
  componentNotFound: 'No encontramos este componente del humedal.',
  componentsLoadError: 'No pudimos cargar los componentes del humedal.',
  componentsEmpty: 'Aún no hay componentes del humedal.',
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
  announcementsTitle: 'Anuncios',
  announcementsRetry: 'REINTENTAR',
  announcementsRefreshButton: 'ACTUALIZAR',
  announcementsPublishedPrefix: 'Publicado el',
  announcementsRefresh: 'Actualizar anuncios',
} as const;

/** Textos de la interfaz de HU-14 y HU-15 (sin diseño en Figma). */
export const WETLAND_LABELS = {
  listTitle: 'Componentes del humedal',
  listSubtitle: 'Conoce cómo funciona cada parte del humedal y su papel en el ecosistema.',
  back: 'Volver',
  retry: 'Reintentar',
  photosSection: 'Fotos',
  photoOf: (name: string) => `Foto de ${name}`,
  updatedAt: (date: string) => `Actualizado el ${date}`,
  editButton: 'EDITAR CONTENIDO',
  editTitle: 'Editar componente',
  nameLabel: 'Nombre',
  namePlaceholder: 'Ej.: Aves',
  descriptionLabel: 'Descripción',
  descriptionPlaceholder: 'Describe el componente y su funcionamiento ecológico',
  photosCounter: (count: number, max: number) => `${count} de ${max} fotos`,
  photosHint: 'Formatos jpg o png, máximo 10 MB cada una.',
  addPhoto: 'Agregar foto',
  removePhoto: 'Quitar foto',
  newPhotoBadge: 'Nueva',
  // HU-15 CA1: "Clic en el botón GUARDAR CAMBIOS."
  saveButton: 'GUARDAR CAMBIOS',
} as const;

/** Límites de HU-15. Fotos: acordados con el backend (409 al pasar de 10, 413 sobre 10 MB). */
export const WETLAND_COMPONENT_LIMITS = {
  maxPhotos: 10,
  photoMaxBytes: 10 * 1024 * 1024,
  photoMimeTypes: ['image/jpeg', 'image/png'],
  nameMaxLength: 80,
  descriptionMaxLength: 4000,
} as const;

/** Ícono de cada componente conocido; los demás usan el genérico del humedal. */
export const WETLAND_COMPONENT_ICONS: Record<string, 'bird' | 'plant' | 'insect'> = {
  AVES: 'bird',
  FLORA: 'plant',
  INSECTOS: 'insect',
};

/** Claves de caché de los componentes del humedal. */
export const wetlandComponentKeys = {
  all: ['wetland-components'] as const,
  list: () => [...wetlandComponentKeys.all, 'list'] as const,
  detail: (type: string) => [...wetlandComponentKeys.all, 'detail', type] as const,
};

/** Límites de longitud del formulario de anuncios (provisionales hasta que el contrato los defina). */
export const ANNOUNCEMENT_LIMITS = {
  titleMaxLength: 120,
  descriptionMaxLength: 2000,
} as const;

/** Claves de caché de la feature (HU-17 lista los anuncios con `announcementKeys.list()`). */
export const announcementKeys = {
  all: ['announcements'] as const,
  list: () => [...announcementKeys.all, 'list'] as const,
};
