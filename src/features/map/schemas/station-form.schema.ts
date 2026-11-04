import { z } from 'zod';

import { STATION_LIMITS, STATION_MESSAGES } from '../constants';

/** Foto elegida en el dispositivo: jpg o png de 10 MB como máximo. */
export const stationPhotoSchema = z.object({
  uri: z.string().min(1),
  fileName: z.string().nullable(),
  mimeType: z.enum(STATION_LIMITS.photoMimeTypes),
  fileSize: z.number().max(STATION_LIMITS.photoMaxBytes).nullable(),
});

/** Convierte el texto de una coordenada en número; acepta coma o punto decimal. */
export function parseCoordinate(value: string): number {
  const normalized = value.trim().replace(',', '.');
  return normalized === '' ? Number.NaN : Number(normalized);
}

const isInRange = (value: string, limit: number) => {
  const number = parseCoordinate(value);
  return Number.isFinite(number) && Math.abs(number) <= limit;
};

/**
 * Formulario de crear y editar estación (HU-13). Las coordenadas se escriben como texto y se validan por
 * rango (CA3: latitud entre -90 y 90, longitud entre -180 y 180). La foto es obligatoria solo al crear; la
 * valida el formulario.
 */
export const stationFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, STATION_MESSAGES.requiredFields)
      .max(STATION_LIMITS.nameMaxLength, STATION_MESSAGES.nameTooLong),
    description: z
      .string()
      .trim()
      .min(1, STATION_MESSAGES.requiredFields)
      .max(STATION_LIMITS.descriptionMaxLength, STATION_MESSAGES.descriptionTooLong),
    latitude: z.string().trim().min(1, STATION_MESSAGES.requiredFields),
    longitude: z.string().trim().min(1, STATION_MESSAGES.requiredFields),
    photo: stationPhotoSchema.nullable(),
    speciesIds: z.array(z.string()),
  })
  .superRefine((values, ctx) => {
    if (values.latitude === '' || values.longitude === '') return;
    if (!isInRange(values.latitude, 90)) {
      ctx.addIssue({
        code: 'custom',
        path: ['latitude'],
        message: STATION_MESSAGES.invalidCoordinates,
      });
    }
    if (!isInRange(values.longitude, 180)) {
      ctx.addIssue({
        code: 'custom',
        path: ['longitude'],
        message: STATION_MESSAGES.invalidCoordinates,
      });
    }
  });

export type StationFormValues = z.infer<typeof stationFormSchema>;
