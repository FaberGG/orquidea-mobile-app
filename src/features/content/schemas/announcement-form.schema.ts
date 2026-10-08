import { z } from 'zod';

import { ANNOUNCEMENT_LIMITS, CONTENT_MESSAGES } from '../constants';

// HU-16 CA2: un solo mensaje si falta el título, el contenido o ambos.
export const announcementFormSchema = z.object({
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
});

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
