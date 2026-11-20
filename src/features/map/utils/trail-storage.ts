import * as FileSystem from 'expo-file-system/legacy';

import { type Coordinates } from '../types';

const LOCAL_TRAIL_FILE = 'terravia-sendero-local.json';

export type SavedLocalTrail = {
  id: string;
  name: string;
  coordinates: Coordinates[];
  stationIds: string[];
};

function createLocalTrailId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isCoordinates(value: unknown): value is Coordinates {
  if (typeof value !== 'object' || value === null) return false;
  const point = value as Record<string, unknown>;
  return (
    typeof point.latitude === 'number' &&
    Number.isFinite(point.latitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    typeof point.longitude === 'number' &&
    Number.isFinite(point.longitude) &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}

function getLocalTrailUri(): string | null {
  const directory = FileSystem.documentDirectory;
  return directory === null ? null : `${directory}${LOCAL_TRAIL_FILE}`;
}

/** Guarda el trazado en el almacenamiento privado de la app, solo para este dispositivo. */
export async function saveLocalTrail(
  trail: Omit<SavedLocalTrail, 'id' | 'stationIds'> & {
    id?: string;
    stationIds?: string[];
  },
): Promise<SavedLocalTrail> {
  const uri = getLocalTrailUri();
  if (uri === null) throw new Error('El almacenamiento local no está disponible.');

  const savedTrail: SavedLocalTrail = {
    ...trail,
    id: trail.id && /^local-[a-z0-9-]+$/i.test(trail.id) ? trail.id : createLocalTrailId(),
    stationIds: trail.stationIds ?? [],
  };
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(savedTrail), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return savedTrail;
}

/** Recupera el recorrido local después de cerrar y volver a abrir la app. */
export async function getLocalTrail(): Promise<SavedLocalTrail | null> {
  const uri = getLocalTrailUri();
  if (uri === null) return null;

  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return null;

    const parsed: unknown = JSON.parse(await FileSystem.readAsStringAsync(uri));
    if (typeof parsed !== 'object' || parsed === null) return null;

    const trail = parsed as Record<string, unknown>;
    if (
      typeof trail.name !== 'string' ||
      !Array.isArray(trail.coordinates) ||
      trail.coordinates.length < 2 ||
      !trail.coordinates.every(isCoordinates)
    ) {
      return null;
    }

    const stationIds = Array.isArray(trail.stationIds)
      ? trail.stationIds.filter((id): id is string => typeof id === 'string')
      : [];
    const id =
      typeof trail.id === 'string' && /^local-[a-z0-9-]+$/i.test(trail.id)
        ? trail.id
        : createLocalTrailId();
    const savedTrail = { id, name: trail.name, coordinates: trail.coordinates, stationIds };
    if (id !== trail.id || !Array.isArray(trail.stationIds)) await saveLocalTrail(savedTrail);
    return savedTrail;
  } catch {
    return null;
  }
}
