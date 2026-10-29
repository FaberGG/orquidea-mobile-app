import { type Coordinates } from '@/lib/location';

import { type STATION_LIMITS } from '../constants';

/** Ficha taxonómica asociada a una estación (resumen que envía la API). */
export type StationSpecies = {
  id: string;
  vernacularName: string;
  photoUrl: string | null;
};

/** Estación del sendero (HU-13): punto del recorrido con su foto y las especies que se observan. */
export type Station = {
  id: string;
  name: string;
  description: string;
  photoUrl: string | null;
  location: Coordinates;
  species: StationSpecies[];
};

/** Foto elegida en el dispositivo, aún no subida. */
export type StationPhoto = {
  uri: string;
  fileName: string | null;
  mimeType: (typeof STATION_LIMITS.photoMimeTypes)[number];
  fileSize: number | null;
};

/** Datos para crear o editar una estación. */
export type StationInput = {
  name: string;
  description: string;
  location: Coordinates;
  /** Ids de las fichas asociadas; al editar, la lista reemplaza a la anterior. */
  speciesIds: string[];
  /** Foto nueva. Al crear es obligatoria; al editar, `null` conserva la actual. */
  photo: StationPhoto | null;
};
