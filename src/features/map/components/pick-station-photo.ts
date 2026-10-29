import * as ImagePicker from 'expo-image-picker';

import { STATION_LIMITS } from '../constants';
import { type StationPhoto } from '../types';

export type PickStationPhotoResult =
  | { status: 'picked'; photo: StationPhoto }
  | { status: 'invalid' }
  | { status: 'tooLarge' }
  | { status: 'cancelled' };

const isAllowedMimeType = (value: string | null | undefined): value is StationPhoto['mimeType'] =>
  STATION_LIMITS.photoMimeTypes.some((allowed) => allowed === value);

/**
 * Abre la galería y valida la imagen: jpg o png, máximo 10 MB. La API repite ambas validaciones
 * (400 y 413); aquí se evita una subida inútil.
 */
export async function pickStationPhoto(): Promise<PickStationPhotoResult> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (result.canceled) return { status: 'cancelled' };

  const asset = result.assets[0];
  if (!isAllowedMimeType(asset.mimeType)) return { status: 'invalid' };
  if (asset.fileSize !== undefined && asset.fileSize > STATION_LIMITS.photoMaxBytes) {
    return { status: 'tooLarge' };
  }
  return {
    status: 'picked',
    photo: {
      uri: asset.uri,
      fileName: asset.fileName ?? null,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize ?? null,
    },
  };
}
