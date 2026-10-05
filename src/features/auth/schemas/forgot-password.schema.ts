import { z } from 'zod';

import { AUTH_MESSAGES } from '../constants';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    // HU-1.1 CA3
    .min(1, AUTH_MESSAGES.emailRequired)
    .pipe(z.email(AUTH_MESSAGES.invalidEmail)),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
