import * as ImagePicker from 'expo-image-picker';

import { WETLAND_COMPONENT_LIMITS } from '../constants';
import { type NewComponentPhoto } from '../types';

export type PickComponentPhotoResult =
  | { status: 'picked'; photo: NewComponentPhoto }
  | { status: 'invalid' }
  | { status: 'tooLarge' }
  | { status: 'cancelled' };

const isAllowedMimeType = (
  value: string | null | undefined,
): value is NewComponentPhoto['mimeType'] =>
  WETLAND_COMPONENT_LIMITS.photoMimeTypes.some((allowed) => allowed === value);

/**
 * Abre la galería y valida la imagen: jpg o png, máximo 10 MB. La API repite ambas validaciones
 * (400 y 413); aquí se evita una subida inútil.
 */
export async function pickComponentPhoto(): Promise<PickComponentPhotoResult> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (result.canceled) return { status: 'cancelled' };

  const asset = result.assets[0];
  if (!isAllowedMimeType(asset.mimeType)) return { status: 'invalid' };
  if (asset.fileSize !== undefined && asset.fileSize > WETLAND_COMPONENT_LIMITS.photoMaxBytes) {
    return { status: 'tooLarge' };
  }
  return {
    status: 'picked',
    photo: { uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName ?? null },
  };
}
