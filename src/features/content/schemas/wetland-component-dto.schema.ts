import { z } from 'zod';

// Validación de la respuesta de `GET /api/componentes` y `GET /api/componentes/{tipo}` antes de
// mapearla (CODIGO §2: los datos externos se validan). Contrato acordado con el backend por chat.

export const wetlandComponentPhotoDtoSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
});

export const wetlandComponentDtoSchema = z.object({
  tipo: z.string().min(1),
  nombre: z.string(),
  descripcion: z.string().nullish(),
  tieneContenido: z.boolean(),
  fotos: z.array(wetlandComponentPhotoDtoSchema).nullish(),
  fechaActualizacion: z.string().nullish(),
});

export const wetlandComponentListDtoSchema = z.array(wetlandComponentDtoSchema);
