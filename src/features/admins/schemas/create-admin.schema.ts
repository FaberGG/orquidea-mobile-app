import { z } from 'zod';

import { ADMIN_MESSAGES } from '../constants';

export const createAdminSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, ADMIN_MESSAGES.requiredFields)
      .min(2, 'El nombre debe tener al menos 2 caracteres.')
      .max(100, ADMIN_MESSAGES.firstNameTooLong),
    lastName: z
      .string()
      .trim()
      .min(1, ADMIN_MESSAGES.requiredFields)
      .min(2, 'El apellido debe tener al menos 2 caracteres.')
      .max(100, ADMIN_MESSAGES.lastNameTooLong),
    email: z
      .string()
      .trim()
      .min(1, ADMIN_MESSAGES.requiredFields)
      .email(ADMIN_MESSAGES.invalidEmail)
      .max(254, ADMIN_MESSAGES.emailTooLong),
    password: z.string().min(1, ADMIN_MESSAGES.requiredFields),
    confirmPassword: z.string().min(1, ADMIN_MESSAGES.requiredFields),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: ADMIN_MESSAGES.passwordMismatch,
    path: ['confirmPassword'],
  });

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>;
