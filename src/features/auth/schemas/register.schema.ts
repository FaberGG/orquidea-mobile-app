import { z } from 'zod';

import { AUTH_MESSAGES } from '../constants';

// Un único mensaje por envío (como en el login). El orden de las comprobaciones define cuál se
// muestra: primero campos vacíos (CA3), luego formato de correo (CA4) y después las reglas del
// contrato (nombre/apellido de 2+ caracteres) y del diseño (confirmación y términos).
export const registerSchema = z
  .object({
    firstName: z.string().trim(),
    lastName: z.string().trim(),
    email: z.string().trim(),
    password: z.string(),
    confirmPassword: z.string(),
    acceptTerms: z.boolean(),
  })
  .superRefine((values, context) => {
    const fail = (message: string, path: keyof typeof values) =>
      context.addIssue({ code: 'custom', message, path: [path] });

    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
    ] as const;
    const emptyField = requiredFields.find((field) => values[field].length === 0);
    if (emptyField) return fail(AUTH_MESSAGES.registerRequiredFields, emptyField);

    if (!z.email().safeParse(values.email).success) {
      return fail(AUTH_MESSAGES.invalidEmail, 'email');
    }
    if (values.firstName.length < 2) return fail(AUTH_MESSAGES.nameTooShort, 'firstName');
    if (values.lastName.length < 2) return fail(AUTH_MESSAGES.nameTooShort, 'lastName');
    if (values.password !== values.confirmPassword) {
      return fail(AUTH_MESSAGES.passwordsDoNotMatch, 'confirmPassword');
    }
    if (!values.acceptTerms) return fail(AUTH_MESSAGES.termsNotAccepted, 'acceptTerms');
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
