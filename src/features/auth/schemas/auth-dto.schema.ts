import { z } from 'zod';

// Validación de las respuestas de la API antes de mapearlas (CODIGO §2: datos externos se validan).

export const authenticatedUserDtoSchema = z.object({
  id: z.string().min(1),
  nombre: z.string(),
  apellido: z.string(),
  correo: z.string(),
  rol: z.enum(['USUARIO_REGISTRADO', 'ADMINISTRADOR', 'SUPERADMINISTRADOR']),
});

export const loginResponseDtoSchema = z.object({
  token: z.string().min(1),
  tipo: z.string().optional(),
  expiraEnSegundos: z.number().positive(),
  usuario: authenticatedUserDtoSchema,
});
