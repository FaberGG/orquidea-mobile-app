import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import OFFLINE_TILES_ASSET from '@/assets/maps/popayan-z14.pmtiles';

import { OFFLINE_MAP_BOUNDS } from '../constants';
import { type Coordinates } from '../types';

// SCRUM-85: `OFFLINE_TILES_ASSET` es el mapa base offline de Popayán (esquema OpenMapTiles), empaquetado
// como asset. Se genera con `npm run maps:build` (ver `scripts/maps/README.md`).

/** Carpeta propia en documentos, fuera de `offline-files/` para que "borrar contenido offline" no la toque. */
const TILES_DIRECTORY = 'bundled-maps';
const TILES_BASE_NAME = 'popayan-z14';

let pendingUri: Promise<string> | null = null;

/** URL que entiende MapLibre para un PMTiles local: `pmtiles://file:///…`. */
export function toPmtilesUrl(fileUri: string): string {
  return `pmtiles://${fileUri}`;
}

/** Si un punto cae dentro del área que cubre el mapa offline. */
export function isInsideOfflineArea({ latitude, longitude }: Coordinates): boolean {
  return (
    latitude >= OFFLINE_MAP_BOUNDS.south &&
    latitude <= OFFLINE_MAP_BOUNDS.north &&
    longitude >= OFFLINE_MAP_BOUNDS.west &&
    longitude <= OFFLINE_MAP_BOUNDS.east
  );
}

/**
 * Ruta `file://` del PMTiles en documentos. La primera vez (y cuando cambia el archivo en una versión
 * nueva de la app) copia el asset a `documents/bundled-maps/popayan-z14-<hash>.pmtiles` y borra las
 * versiones anteriores. En un build release el asset viene dentro de la app, así que no descarga nada: sirve
 * desde la instalación y en modo avión. Se resuelve una sola vez por sesión.
 */
export function getOfflineTilesUri(): Promise<string> {
  pendingUri ??= copyTilesToDocuments().catch((error: unknown) => {
    // Si falló (p. ej. sin espacio), el siguiente intento vuelve a probar.
    pendingUri = null;
    throw error;
  });
  return pendingUri;
}

async function copyTilesToDocuments(): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('El mapa offline no está disponible en web.');
  }

  const asset = Asset.fromModule(OFFLINE_TILES_ASSET);
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error('No se encontró el mapa offline dentro de la app.');
  }

  const directory = new Directory(Paths.document, TILES_DIRECTORY);
  directory.create({ intermediates: true, idempotent: true });
  const target = new File(directory, `${TILES_BASE_NAME}-${asset.hash ?? 'v1'}.pmtiles`);
  if (target.exists) return target.uri;

  // Versión nueva: se borran las anteriores y se copia primero a un temporal para no dejar un archivo a
  // medias con el nombre final si la app se cierra durante la copia.
  for (const entry of directory.list()) {
    if (entry instanceof File && entry.name.startsWith(`${TILES_BASE_NAME}-`)) entry.delete();
  }
  const temporary = new File(directory, `${TILES_BASE_NAME}.tmp`);
  if (temporary.exists) temporary.delete();
  await new File(asset.localUri).copy(temporary);
  await temporary.move(target);
  return target.uri;
}
