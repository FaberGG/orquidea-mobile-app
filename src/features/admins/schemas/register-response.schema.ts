import { z } from 'zod';

/** Respuesta real de `registrarAdmin`; valida datos externos antes de mostrarlos. */
export const registerResponseSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  apellido: z.string(),
  correo: z.string(),
  rol: z.literal('ADMINISTRADOR'),
});
