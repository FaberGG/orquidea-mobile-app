/** Textos de la interfaz de HE-05 (mapa del sendero). */
export const MAP_LABELS = {
  placeholderTitle: 'Mapa del sendero',
  placeholderDescription:
    'Pronto podrás ver las estaciones del sendero y orientarte durante tu recorrido.',
} as const;

/** Mensajes de HU-13 (copiados de los criterios de aceptación) y respaldos locales. */
export const STATION_MESSAGES = {
  requiredFields: 'Debes completar todos los campos obligatorios.',
  // HU-13 CA2
  updated: 'La estación se actualizó correctamente.',
  // HU-13 CA3
  invalidCoordinates: 'Las coordenadas ingresadas no son válidas.',
  // Mismo texto de HU-7 CA3 para la foto.
  invalidImage: 'El formato de la imagen no es válido.',
  imageTooLarge: 'La imagen supera el tamaño máximo de 10 MB.',
  nameTooLong: 'El nombre no puede superar 150 caracteres.',
  descriptionTooLong: 'La descripción no puede superar 2000 caracteres.',
  saveError: 'No pudimos guardar la estación. Inténtalo de nuevo.',
  deleteError: 'No pudimos eliminar la estación. Inténtalo de nuevo.',
  loadError: 'No pudimos cargar las estaciones. Revisa tu conexión e inténtalo de nuevo.',
  notFound: 'Esta estación no existe o ya no está disponible.',
  empty: 'Aún no hay estaciones registradas.',
  locationDenied: 'Activa el permiso de ubicación para usar tu posición actual.',
  locationError: 'No pudimos obtener tu ubicación. Escribe las coordenadas.',
  speciesLoadError: 'No pudimos cargar las fichas taxonómicas.',
  speciesEmpty: 'Aún no hay fichas taxonómicas para asociar.',
} as const;

export const STATION_LABELS = {
  listTitle: 'Estaciones del sendero',
  listSubtitle:
    'Mientras el mapa está en desarrollo, consulta aquí las estaciones del recorrido y sus especies.',
  create: 'Nueva estación',
  createTitle: 'Nueva estación',
  editTitle: 'Editar estación',
  // HU-13 CA1 y CA4
  createSubmit: 'GUARDAR ESTACIÓN',
  // HU-13 CA2
  editSubmit: 'GUARDAR CAMBIOS',
  back: 'Volver',
  retry: 'REINTENTAR',
  name: 'Nombre',
  namePlaceholder: 'Ej. Mirador de la laguna',
  description: 'Descripción',
  descriptionPlaceholder: 'Qué se puede observar en esta estación…',
  photoSection: 'Fotografía',
  photoUpload: 'Subir fotografía',
  photoChange: 'Cambiar foto',
  photoHint: 'JPG, PNG · máx. 10 MB',
  locationSection: 'Ubicación',
  latitude: 'Latitud',
  longitude: 'Longitud',
  latitudePlaceholder: 'Ej. 2.459800',
  longitudePlaceholder: 'Ej. -76.611500',
  useCurrentLocation: 'Usar mi ubicación actual',
  locating: 'Obteniendo ubicación…',
  speciesSection: 'Fichas asociadas',
  speciesHint: 'Opcional. Elige las especies que se observan en esta estación.',
  speciesSelected: (count: number) =>
    count === 1 ? '1 ficha seleccionada' : `${count} fichas seleccionadas`,
  speciesCount: (count: number) =>
    count === 0 ? 'Sin fichas asociadas' : count === 1 ? '1 ficha' : `${count} fichas`,
  openInMaps: 'Ver en la app de mapas',
  edit: 'Editar estación',
  // HU-13 CA5
  delete: 'ELIMINAR',
  deleteTitle: '¿Eliminar esta estación?',
  deleteDescription: 'La estación desaparecerá del mapa. Esta acción no se puede deshacer.',
  confirm: 'CONFIRMAR',
  cancel: 'CANCELAR',
  photoOf: (name: string) => `Foto de ${name}`,
} as const;

/** Límites del contrato inferido (docs/api/estaciones.md). */
export const STATION_LIMITS = {
  nameMaxLength: 150,
  descriptionMaxLength: 2000,
  photoMaxBytes: 10 * 1024 * 1024,
  photoMimeTypes: ['image/jpeg', 'image/png'],
} as const;

/** Claves de caché de las estaciones. El mapa (HU-12) debe invalidarse junto con ellas cuando exista. */
export const stationKeys = {
  all: ['stations'] as const,
  list: () => [...stationKeys.all, 'list'] as const,
  detail: (id: string) => [...stationKeys.all, 'detail', id] as const,
};
