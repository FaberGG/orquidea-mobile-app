import { z } from 'zod';

import { CONTENT_MESSAGES, WETLAND_COMPONENT_LIMITS } from '../constants';

/** HU-15: el nombre y la descripción del componente son obligatorios en la API. */
export const wetlandComponentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, CONTENT_MESSAGES.componentRequiredFields)
    .max(WETLAND_COMPONENT_LIMITS.nameMaxLength),
  description: z
    .string()
    .trim()
    .min(1, CONTENT_MESSAGES.componentRequiredFields)
    .max(WETLAND_COMPONENT_LIMITS.descriptionMaxLength),
});

export type WetlandComponentFormValues = z.infer<typeof wetlandComponentFormSchema>;
