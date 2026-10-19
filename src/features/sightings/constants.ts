import { type Kingdom } from './types';

/** Textos de la interfaz de HE-07 (reporte ciudadano de avistamientos). */
export const SIGHTINGS_LABELS = {
  // Pestaña Comunidad (Figma: "Comunidad · Usuario" y "Comunidad · Administrador")
  communityTitle: 'Comunidad',
  announcements: 'Anuncios (próximamente)',
  tabFeed: 'Comunidad',
  tabModeration: 'Moderación',
  newReport: 'Escribir un reporte',
  loadError: 'No pudimos cargar los avistamientos. Revisa tu conexión e inténtalo de nuevo.',
  retry: 'REINTENTAR',
  loadingMore: 'Cargando más avistamientos',
  // Publicación del foro
  openPhoto: 'Ver foto completa',
  showMore: 'Ver más',
  showLess: 'Ver menos',
  openLocation: 'Ver el lugar en el mapa',
  unknownClassification: 'Especie sin identificar',
  // Visor de foto
  closePhoto: 'Cerrar foto',
  photoHint: 'Pellizca o toca dos veces para acercar',
  // Moderación (HU-19)
  pendingStatus: 'Pendiente de revisión',
  approve: 'Aprobar',
  reject: 'Rechazar',
  rejectConfirmQuestion: '¿Rechazar este reporte? No se publicará y no se puede deshacer.',
  rejectConfirm: 'Sí, rechazar',
  cancel: 'Cancelar',
  noPendingTitle: 'No hay reportes pendientes',
  noPendingDescription: 'Cuando la comunidad envíe nuevos avistamientos aparecerán aquí.',
  // Visitante que intenta reportar
  loginRequiredTitle: 'Inicia sesión para reportar',
  loginRequiredDescription:
    'Debes iniciar sesión para registrar un reporte de avistamiento y compartirlo con la comunidad.',
  loginButton: 'INICIAR SESIÓN',
  notNow: 'Ahora no',
  // Confirmación de HU-18
  backToCommunity: 'Volver a la comunidad',
} as const;

/** Textos del formulario de HU-18 (Figma: "Publicar reporte ciudadano"). */
export const SIGHTING_FORM_LABELS = {
  title: 'Nuevo reporte',
  back: 'Volver',
  introTitle: 'Comparte tu avistamiento',
  introDescription:
    'Completa los datos que tengas disponibles. Solo la descripción es obligatoria.',
  photoSection: 'Fotografía',
  photoUpload: 'Subir fotografía',
  photoChange: 'Cambiar foto',
  photoRemove: 'Quitar foto',
  photoHint: 'JPG, PNG · máx. 10 MB · opcional',
  classificationSection: 'Clasificación',
  kingdomLabel: 'Reino',
  vernacularName: 'Clasificación específica',
  vernacularNamePlaceholder: 'Ej. Martín pescador',
  vernacularNameUnknown: 'No sé qué especie es (Desconocido)',
  remarksSection: 'Descripción*',
  remarksLabel: 'Lo que observaste',
  remarksPlaceholder: 'Describe el animal o la planta, la hora y cualquier detalle relevante.',
  locationSection: 'Ubicación',
  locationLabel: 'Lugar del avistamiento',
  useCurrentLocation: 'Usar mi ubicación actual',
  locating: 'Obteniendo ubicación…',
  removeLocation: 'Quitar ubicación',
  reviewNoteTitle: 'Revisión administrativa',
  reviewNote: 'Este reporte se revisará por administración antes de aparecer en el foro. ',
  reviewNoteBold: 'No se publicará de forma inmediata.',
  submit: 'Enviar reporte',
  cancel: 'Cancelar',
} as const;

/** Mensajes de HU-18, HU-19 y HU-20 (copiados de los criterios de aceptación) y respaldos locales. */
export const SIGHTINGS_MESSAGES = {
  // HU-18 CA1
  created: 'Tu reporte fue enviado y será revisado por un administrador.',
  // HU-18 CA2
  remarksRequired: 'La descripción es obligatoria.',
  // HU-20 CA2
  noApprovedSightings: 'Aún no hay avistamientos publicados.',
  // Reglas del contrato (docs/api/reportes-avistamiento.md); el servidor repite la validación.
  remarksTooLong: 'La descripción no puede superar 2000 caracteres.',
  vernacularNameTooLong: 'La clasificación no puede superar 150 caracteres.',
  invalidImage: 'El formato de la imagen no es válido.',
  imageTooLarge: 'La imagen supera el tamaño máximo permitido de 10 MB.',
  // Respaldos locales
  saveError: 'No pudimos enviar tu reporte. Inténtalo de nuevo.',
  reviewError: 'No pudimos guardar la revisión. Inténtalo de nuevo.',
  locationDenied: 'Para agregar el lugar, permite el acceso a tu ubicación en los ajustes.',
  locationError: 'No pudimos obtener tu ubicación. Inténtalo de nuevo.',
  approved: 'El reporte fue aprobado y ya aparece en el foro.',
  rejected: 'El reporte fue rechazado y no se publicará.',
} as const;

/** Límites de `OccurrenceRequest`. */
export const SIGHTING_LIMITS = {
  remarksMaxLength: 2000,
  vernacularNameMaxLength: 150,
} as const;

/** Tamaño de página del foro y de la cola (la API acepta 1–50). */
export const SIGHTINGS_PAGE_SIZE = 10;

/** Opciones de reino del formulario y etiquetas visibles. `unknown` es "Desconocido" (HU-18 CA3). */
export const KINGDOM_OPTIONS = [
  { id: 'animalia', label: 'Animal' },
  { id: 'plantae', label: 'Planta' },
  { id: 'fungi', label: 'Hongo' },
  { id: 'unknown', label: 'Desconocido' },
] as const satisfies readonly { id: Kingdom; label: string }[];

export const KINGDOM_LABELS: Record<Kingdom, string> = {
  animalia: 'Animal',
  plantae: 'Planta',
  fungi: 'Hongo',
  unknown: 'Reino desconocido',
};

/**
 * Proporciones (ancho / alto) en las que se muestra la foto en el foro. Las fotos más altas que 4:5 o
 * más anchas que 1.91:1 se recortan al centro, como en Instagram; la foto completa se ve al tocarla.
 */
export const FEED_PHOTO_ASPECT = {
  min: 4 / 5,
  max: 1.91,
  /** Mientras carga la imagen no se conoce su tamaño: se reserva un cuadrado. */
  initial: 1,
} as const;

/** Claves de caché de la feature. */
export const sightingsKeys = {
  all: ['sightings'] as const,
  approved: () => [...sightingsKeys.all, 'approved'] as const,
  pending: () => [...sightingsKeys.all, 'pending'] as const,
};
