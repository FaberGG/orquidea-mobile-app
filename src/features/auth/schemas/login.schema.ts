import { z } from 'zod';

import { AUTH_MESSAGES } from '../constants';

// HU-1 CA3: un solo mensaje si falta el correo, la contraseña o ambos. El contrato solo exige
// minLength 1; el formato del correo lo valida la API (responde "Correo o contraseña incorrectos.").
export const loginSchema = z.object({
  email: z.string().trim().min(1, AUTH_MESSAGES.requiredFields),
  password: z.string().min(1, AUTH_MESSAGES.requiredFields),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
