import { z } from 'zod';

/** Contrato de lectura pública de `GET /api/anuncios` (HU-17). */
export const announcementDtoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  descripcion: z.string(),
  fechaCreacion: z.iso.datetime(),
});

export const announcementListDtoSchema = z.array(announcementDtoSchema);
