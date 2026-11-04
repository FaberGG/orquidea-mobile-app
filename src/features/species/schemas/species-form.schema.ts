import { z } from 'zod';

import { CONSERVATION_CODES, SPECIES_FORM_CATEGORIES, SPECIES_MESSAGES } from '../constants';

/** HU-7 CA3 y docs/api: la foto debe ser jpg o png y no superar 10 MB. */
export const SPECIES_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const SPECIES_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png'] as const;
/** HU-7 v2.0 (SCRUM-47): fotos por ficha, igual que los componentes del humedal. */
export const SPECIES_PHOTO_LIMIT = 10;

const requiredText = z.string().trim().min(1, SPECIES_MESSAGES.requiredFields);

/** Foto elegida en el dispositivo, aún no subida. */
export const speciesPhotoSchema = z.object({
  uri: z.string().min(1),
  fileName: z.string().nullable(),
  mimeType: z.enum(SPECIES_PHOTO_MIME_TYPES),
  fileSize: z.number().max(SPECIES_PHOTO_MAX_BYTES).nullable(),
});

/**
 * Formulario de crear y editar ficha (HU-7, HU-8). Los campos obligatorios son los de `TaxonRequest`.
 * Las fotos (una o más) las valida el formulario, porque al editar dependen de las ya guardadas.
 */
export const speciesFormSchema = z
  .object({
    newPhotos: z.array(speciesPhotoSchema).max(SPECIES_PHOTO_LIMIT),
    removedPhotoIds: z.array(z.string()),
    category: z.enum(SPECIES_FORM_CATEGORIES).nullable(),
    vernacularName: requiredText,
    scientificName: requiredText,
    order: requiredText,
    family: requiredText,
    genus: requiredText,
    diet: requiredText,
    wetlandRole: requiredText,
    conservationStatus: z.enum(CONSERVATION_CODES).nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.category === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['category'],
        message: SPECIES_MESSAGES.requiredFields,
      });
    }
    if (values.conservationStatus === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['conservationStatus'],
        message: SPECIES_MESSAGES.requiredFields,
      });
    }
  });

/** Valores del formulario ya validados. */
export type SpeciesFormValues = z.infer<typeof speciesFormSchema>;
export type SpeciesPhoto = z.infer<typeof speciesPhotoSchema>;
