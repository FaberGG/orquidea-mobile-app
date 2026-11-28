import { type LngLat } from '@maplibre/maplibre-react-native';

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
  closeDetails: 'Cerrar detalles de estación',
  openStation: (name: string) => `Ver estación ${name}`,
  species: (name: string) => `Abrir ficha de ${name}`,
} as const;

/**
 * Estilo del mapa base con conexión: OpenFreeMap (gratuito, sin API key, esquema OpenMapTiles). Es el estilo
 * público "Liberty" mientras llega el estilo propio del proyecto (tarea 3 del plan del mapa).
 */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Atribución obligatoria de los datos (ODbL) y del esquema de los mosaicos; debe verse sobre el mapa. */
export const MAP_ATTRIBUTION = '© OpenStreetMap contributors · © OpenMapTiles';

/**
 * Centro aproximado del Humedal La Orquídea (el mismo punto de ejemplo de docs/api/estaciones.md). Se
 * usa para abrir el selector de ubicación cuando no hay un punto elegido ni se pudo cargar el sendero.
 */
export const WETLAND_CENTER = { latitude: 2.4598, longitude: -76.6115 } as const;

/**
 * Área que cubre el mapa base offline incluido en la app (`assets/maps/popayan-z14.pmtiles`): el recuadro
 * urbano de Popayán con el humedal. Mismos valores que `scripts/maps/build-offline-map.cjs`.
 */
export const OFFLINE_MAP_BOUNDS = {
  west: -76.706028,
  south: 2.401735,
  east: -76.535912,
  north: 2.521901,
} as const;

/**
 * SCRUM-84: si OpenFreeMap no termina de cargar el estilo en este tiempo (con conexión), el mapa pasa al
 * mapa offline incluido en la app.
 */
export const ONLINE_MAP_TIMEOUT_MS = 8_000;

/**
 * SCRUM-84: tiempo que un cambio de red debe mantenerse antes de cambiar la fuente del mapa. Igual a
 * `OFFLINE_RECONNECT_SETTLE_MS` (`features/offline/constants.ts`); no se importa de allí porque esa feature
 * ya depende de `features/map` y se formaría un ciclo. Si cambia uno, cambiar el otro.
 */
export const MAP_SOURCE_SETTLE_MS = 2_000;

/**
 * SCRUM-83 / SCRUM-84: ilustración del humedal (`assets/maps/humedal-ilustracion.png`, 480 × 480 px,
 * fondo transparente) y sus esquinas en `[longitud, latitud]`, en el orden que pide MapLibre: superior
 * izquierda, superior derecha, inferior derecha e inferior izquierda. Valores de `referencia.json` de la
 * entrega de SCRUM-83 (27/11/2026). **Provisionales:** falta validar la alineación con el recorrido y las
 * estaciones reales en QGIS.
 */
export const WETLAND_ILLUSTRATION: {
  coordinates: [topLeft: LngLat, topRight: LngLat, bottomRight: LngLat, bottomLeft: LngLat];
  minZoom: number;
} = {
  coordinates: [
    [-76.63229896509098, 2.457778512731378],
    [-76.63117786761639, 2.457778512731378],
    [-76.63117786761639, 2.4566584460916596],
    [-76.63229896509098, 2.4566584460916596],
  ],
  minZoom: 15,
};

/** SCRUM-84: avisos del cambio automático de fuente del mapa (textos literales de la tarea). */
export const MAP_SOURCE_MESSAGES = {
  offline: 'Usar mapa offline',
  online: 'Usando mapa con conexión',
  // Respaldo local, pendiente de aprobar en HU-21.
  outsideOfflineArea:
    'Sin conexión, el mapa solo cubre Popayán y tu ubicación está fuera de esa zona.',
} as const;

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
  // SCRUM-85: selector sin conexión. Respaldo local, pendiente de aprobar en HU-21.
  offlineHint:
    'Sin conexión: el mapa muestra Popayán. Fuera de esa zona, usa tu ubicación por GPS.',
  outsideOfflineArea:
    'Ese punto está fuera del mapa sin conexión de Popayán. Revisa que sea correcto o usa tu ubicación por GPS.',
  offlineMapLoading: 'Preparando el mapa sin conexión…',
  offlineMapUnavailable:
    'No pudimos abrir el mapa sin conexión. Usa tu ubicación por GPS o inténtalo con conexión.',
  useGps: 'USAR MI UBICACIÓN (GPS)',
  locating: 'Obteniendo ubicación…',
  locationDenied: 'Activa el permiso de ubicación para usar tu posición actual.',
  locationError: 'No pudimos obtener tu ubicación. Comprueba que el GPS esté activo.',
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
