import { z } from 'zod';

import { ANNOUNCEMENT_LIMITS, CONTENT_MESSAGES } from '../constants';

const PRIORITIES = ['high', 'medium', 'low'] as const;

/**
 * Formulario de publicar anuncio:
 * - HU-16 CA2: un solo mensaje si falta el título, el contenido o ambos.
 * - HU-16 CA3: la prioridad es obligatoria (la API la exige).
 * - HU-23 CA3: la fecha de finalización, si se elige, debe ser posterior a la fecha actual. Se compara
 *   con el momento de publicar, no con el de abrir el formulario.
 */
export const announcementFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, CONTENT_MESSAGES.announcementRequiredFields)
      .max(ANNOUNCEMENT_LIMITS.titleMaxLength),
    description: z
      .string()
      .trim()
      .min(1, CONTENT_MESSAGES.announcementRequiredFields)
      .max(ANNOUNCEMENT_LIMITS.descriptionMaxLength),
    priority: z.enum(PRIORITIES).nullable(),
    expiresAt: z.date().nullable(),
  })
  .superRefine((values, context) => {
    if (values.priority === null) {
      context.addIssue({
        code: 'custom',
        path: ['priority'],
        message: CONTENT_MESSAGES.announcementPriorityRequired,
      });
    }
    if (values.expiresAt !== null && values.expiresAt.getTime() <= Date.now()) {
      context.addIssue({
        code: 'custom',
        path: ['expiresAt'],
        message: CONTENT_MESSAGES.announcementExpirationInvalid,
      });
    }
  });

export type AnnouncementFormValues = z.input<typeof announcementFormSchema>;
