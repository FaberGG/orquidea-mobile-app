import { z } from 'zod';

import { AUTH_MESSAGES } from '../constants';

// Un único mensaje por envío: campos vacíos → código de 6 dígitos (contrato `\d{6}`) →
// contraseñas iguales.
export const resetPasswordSchema = z
  .object({
    code: z.string().trim(),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((values, context) => {
    const fail = (message: string, path: keyof typeof values) =>
      context.addIssue({ code: 'custom', message, path: [path] });

    const fields = ['code', 'password', 'confirmPassword'] as const;
    const emptyField = fields.find((field) => values[field].length === 0);
    if (emptyField) return fail(AUTH_MESSAGES.resetRequiredFields, emptyField);
    if (!/^\d{6}$/.test(values.code)) return fail(AUTH_MESSAGES.invalidCode, 'code');
    if (values.password !== values.confirmPassword) {
      return fail(AUTH_MESSAGES.passwordsDoNotMatch, 'confirmPassword');
    }
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
