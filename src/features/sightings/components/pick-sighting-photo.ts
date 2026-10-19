import * as ImagePicker from 'expo-image-picker';

import {
  SIGHTING_PHOTO_MAX_BYTES,
  SIGHTING_PHOTO_MIME_TYPES,
  type SightingPhoto,
} from '../schemas/sighting-form.schema';

export type PickSightingPhotoResult =
  | { status: 'picked'; photo: SightingPhoto }
  | { status: 'invalid' }
  | { status: 'tooLarge' }
  | { status: 'cancelled' };

const isAllowedMimeType = (value: string | null | undefined): value is SightingPhoto['mimeType'] =>
  SIGHTING_PHOTO_MIME_TYPES.some((allowed) => allowed === value);

/**
 * Abre la galería y valida la imagen elegida: jpg o png, máximo 10 MB (docs/api). La API solo acepta
 * una foto por reporte, así que la selección es simple. El servidor repite la validación.
 */
export async function pickSightingPhoto(): Promise<PickSightingPhotoResult> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
  });
  if (result.canceled) return { status: 'cancelled' };

  const asset = result.assets[0];
  if (!isAllowedMimeType(asset.mimeType)) return { status: 'invalid' };
  if (asset.fileSize !== undefined && asset.fileSize > SIGHTING_PHOTO_MAX_BYTES) {
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
