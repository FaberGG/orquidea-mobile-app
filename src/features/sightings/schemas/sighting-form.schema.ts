import { z } from 'zod';

import { SIGHTING_LIMITS, SIGHTINGS_MESSAGES } from '../constants';

/** docs/api: la foto es opcional; si se envía, jpg o png y máximo 10 MB. */
export const SIGHTING_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const SIGHTING_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

export const sightingPhotoSchema = z.object({
  uri: z.string().min(1),
  fileName: z.string().nullable(),
  mimeType: z.enum(SIGHTING_PHOTO_MIME_TYPES),
  fileSize: z.number().max(SIGHTING_PHOTO_MAX_BYTES).nullable(),
});

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * Formulario de HU-18. Solo la descripción es obligatoria (CA2); reino y clasificación pueden quedar
 * como "Desconocido" (CA3). Las reglas de longitud son las de `OccurrenceRequest`.
 */
export const sightingFormSchema = z.object({
  photo: sightingPhotoSchema.nullable(),
  /** `null` = no se eligió reino: se envía `DESCONOCIDO`. */
  kingdom: z.enum(['animalia', 'plantae', 'fungi', 'unknown']).nullable(),
  vernacularName: z
    .string()
    .trim()
    .max(SIGHTING_LIMITS.vernacularNameMaxLength, SIGHTINGS_MESSAGES.vernacularNameTooLong),
  /** HU-18 CA3: el usuario marca que no sabe qué especie es. */
  isVernacularNameUnknown: z.boolean(),
  remarks: z
    .string()
    .trim()
    .min(1, SIGHTINGS_MESSAGES.remarksRequired)
    .max(SIGHTING_LIMITS.remarksMaxLength, SIGHTINGS_MESSAGES.remarksTooLong),
  location: coordinatesSchema.nullable(),
});

export type SightingFormValues = z.infer<typeof sightingFormSchema>;
export type SightingPhoto = z.infer<typeof sightingPhotoSchema>;
