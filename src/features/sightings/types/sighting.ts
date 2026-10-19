import { type SightingPhoto } from '../schemas/sighting-form.schema';

/** Reino (DwC `kingdom`). `unknown` = la API `DESCONOCIDO` (HU-18 CA3). */
export type Kingdom = 'animalia' | 'plantae' | 'fungi' | 'unknown';

/** Estado de revisión del reporte (HU-19). */
export type SightingStatus = 'pending' | 'approved' | 'rejected';

/** Lugar del avistamiento. La API solo guarda coordenadas, sin nombre del lugar. */
export type Coordinates = {
  latitude: number;
  longitude: number;
};

/** Reporte ciudadano de avistamiento tal como lo usa la app (`OccurrenceDto`). */
export type Sighting = {
  id: string;
  /** Descripción (DwC `occurrenceRemarks`). */
  remarks: string;
  kingdom: Kingdom;
  /** Clasificación específica (DwC `vernacularName`); `null` si la API envía "Desconocido". */
  vernacularName: string | null;
  location: Coordinates | null;
  /** Nombre y apellido del autor (DwC `recordedBy`). */
  author: string;
  photoUrl: string | null;
  status: SightingStatus;
  /** Fecha de envío (ISO-8601). */
  createdAt: string;
  /** Fecha de aprobación o rechazo (ISO-8601); `null` mientras está pendiente. */
  reviewedAt: string | null;
};

/** Página de reportes (`PageResponse<OccurrenceDto>`). */
export type SightingPage = {
  items: Sighting[];
  /** Número de página, desde 0. */
  page: number;
  totalPages: number;
};

/** Datos que se envían para crear un reporte (`OccurrenceRequest`, multipart). */
export type SightingInput = {
  remarks: string;
  kingdom: Kingdom;
  /** Vacío = "Desconocido" (la API lo completa). */
  vernacularName: string;
  location: Coordinates | null;
  photo: SightingPhoto | null;
};
