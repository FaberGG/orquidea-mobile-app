import * as ImagePicker from 'expo-image-picker';

import {
  SPECIES_PHOTO_MAX_BYTES,
  SPECIES_PHOTO_MIME_TYPES,
  type SpeciesPhoto,
} from '../schemas/species-form.schema';

export type PickSpeciesPhotoResult =
  | { status: 'picked'; photo: SpeciesPhoto }
  | { status: 'invalid' }
  | { status: 'tooLarge' }
  | { status: 'cancelled' };

const isAllowedMimeType = (value: string | null | undefined): value is SpeciesPhoto['mimeType'] =>
  SPECIES_PHOTO_MIME_TYPES.some((allowed) => allowed === value);

/**
 * Abre la galería y valida la imagen elegida: jpg o png, máximo 10 MB (HU-7 CA3, docs/api).
 * La validación del tamaño se repite en el servidor (413); aquí evita una subida inútil.
 */
export async function pickSpeciesPhoto(): Promise<PickSpeciesPhotoResult> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
  });
  if (result.canceled) return { status: 'cancelled' };

  const asset = result.assets[0];
  if (!isAllowedMimeType(asset.mimeType)) return { status: 'invalid' };
  if (asset.fileSize !== undefined && asset.fileSize > SPECIES_PHOTO_MAX_BYTES) {
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
