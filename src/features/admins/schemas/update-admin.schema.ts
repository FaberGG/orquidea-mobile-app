import { z } from 'zod';

import { ADMIN_MESSAGES } from '../constants';

export const updateAdminSchema = z.object({
  firstName: z.string().trim().min(1, ADMIN_MESSAGES.requiredFields).max(100),
  lastName: z.string().trim().min(1, ADMIN_MESSAGES.requiredFields).max(100),
  email: z
    .string()
    .trim()
    .min(1, ADMIN_MESSAGES.requiredFields)
    .email(ADMIN_MESSAGES.invalidEmail)
    .max(254),
  isEnabled: z.boolean(),
});

export type UpdateAdminFormValues = z.infer<typeof updateAdminSchema>;
