import * as ImagePicker from 'expo-image-picker';

import {
  SPECIES_PHOTO_MAX_BYTES,
  SPECIES_PHOTO_MIME_TYPES,
  type SpeciesPhoto,
} from '../schemas/species-form.schema';

/** Motivo por el que se descartó alguna de las imágenes elegidas. */
export type RejectedPhotoReason = 'invalid' | 'tooLarge' | 'overLimit';

export type PickSpeciesPhotosResult =
  | {
      status: 'picked';
      /** Imágenes válidas, en el orden en que se eligieron. */
      photos: SpeciesPhoto[];
      /** Primer motivo de descarte, o `null` si todas eran válidas. */
      rejected: RejectedPhotoReason | null;
    }
  | { status: 'cancelled' };

const isAllowedMimeType = (value: string | null | undefined): value is SpeciesPhoto['mimeType'] =>
  SPECIES_PHOTO_MIME_TYPES.some((allowed) => allowed === value);

/**
 * Abre la galería con selección múltiple (HU-7 v2.0) y valida cada imagen: jpg o png, máximo 10 MB
 * (HU-7 CA3, docs/api). `remaining` es cuántas fotos caben aún en la ficha; las de más se descartan aunque
 * el sistema permita elegirlas. La validación se repite en el servidor (400 / 413); aquí evita subidas inútiles.
 */
export async function pickSpeciesPhotos(remaining: number): Promise<PickSpeciesPhotosResult> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    orderedSelection: true,
  });
  if (result.canceled) return { status: 'cancelled' };

  const photos: SpeciesPhoto[] = [];
  let rejected: RejectedPhotoReason | null = null;
  for (const asset of result.assets) {
    const { mimeType } = asset;
    const reason: RejectedPhotoReason | null = !isAllowedMimeType(mimeType)
      ? 'invalid'
      : asset.fileSize !== undefined && asset.fileSize > SPECIES_PHOTO_MAX_BYTES
        ? 'tooLarge'
        : photos.length >= remaining
          ? 'overLimit'
          : null;
    if (reason !== null || !isAllowedMimeType(mimeType)) {
      rejected ??= reason;
      continue;
    }
    photos.push({
      uri: asset.uri,
      fileName: asset.fileName ?? null,
      mimeType,
      fileSize: asset.fileSize ?? null,
    });
  }
  return { status: 'picked', photos, rejected };
}
