/** Textos y claves de caché del mapa del sendero (HU-12). */
export const MAP_LABELS = {
  loading: 'Cargando el mapa del sendero…',
  retry: 'REINTENTAR',
  loadError: 'No pudimos cargar el mapa. Revisa tu conexión e inténtalo de nuevo.',
  emptyTitle: 'El mapa aún no está disponible',
  emptyDescription: 'Todavía no se han publicado el recorrido y sus estaciones.',
  stations: 'Estaciones',
  stationDetails: 'Detalles de la estación',
  noStationDescription: 'No hay una descripción disponible para esta estación.',
  noStationPhoto: 'Foto no disponible',
  associatedSpecies: 'Fichas de esta estación',
  noAssociatedSpecies: 'Esta estación todavía no tiene fichas asociadas.',
  currentLocation: 'Mi ubicación',
  requestLocation: 'Mostrar mi ubicación',
  locationDenied: 'Permite el acceso a tu ubicación para encontrar la estación más cercana.',
  locationUnavailable: 'No pudimos obtener tu ubicación. Comprueba que el GPS esté activo.',
  locationTrackingUnavailable:
    'No pudimos actualizar tu ubicación en tiempo real. Puedes volver a intentarlo.',
  nearestStation: 'Estación más cercana',
  distance: (meters: number) =>
    meters < 1000
      ? `${Math.round(meters)} m`
      : `${(meters / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} km`,
  satellite: 'Vista satelital',
  standard: 'Vista de mapa',
  closeDetails: 'Cerrar detalles de estación',
  openStation: (name: string) => `Ver estación ${name}`,
  species: (name: string) => `Abrir ficha de ${name}`,
} as const;

/**
 * Centro aproximado del Humedal La Orquídea (el mismo punto de ejemplo de docs/api/estaciones.md). Se
 * usa para abrir el selector de ubicación cuando no hay un punto elegido ni se pudo cargar el sendero.
 */
export const WETLAND_CENTER = { latitude: 2.4598, longitude: -76.6115 } as const;

/** SCRUM-72: selector de ubicación en el mapa (estaciones y avistamientos). Sin textos en las HU. */
export const LOCATION_PICKER_LABELS = {
  open: 'Elegir en el mapa',
  change: 'Cambiar en el mapa',
  title: 'Elige la ubicación',
  hint: 'Toca el mapa para poner el marcador. Puedes arrastrarlo para ajustarlo.',
  mapLabel: 'Mapa para elegir la ubicación',
  selectedPoint: 'Ubicación elegida',
  noPoint: 'Aún no has elegido un punto.',
  coordinates: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
    `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
  cancel: 'CANCELAR',
  confirm: 'CONFIRMAR',
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
  /** HU-21 CA2: la sección no se descargó antes de quedarse sin conexión. */
  offlineUnavailable:
    'Esta información no está disponible sin conexión. Conéctate a internet para descargarla.',
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

export const mapKeys = {
  all: ['trail-map'] as const,
  detail: () => [...mapKeys.all, 'detail'] as const,
};
