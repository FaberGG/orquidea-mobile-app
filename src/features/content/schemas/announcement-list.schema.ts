import { z } from 'zod';

/** Contrato de lectura pública de `GET /api/anuncios` (HU-17). */
export const announcementDtoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  descripcion: z.string(),
  fechaCreacion: z.iso.datetime(),
});

export const announcementListDtoSchema = z.array(announcementDtoSchema);

/** Contrato de `GET /api/anuncios/administracion` (HU-24): todos los anuncios con su estado. */
export const adminAnnouncementDtoSchema = announcementDtoSchema.extend({
  prioridad: z.enum(['ALTA', 'MEDIA', 'BAJA']),
  estado: z.enum(['ACTIVO', 'INACTIVO']),
  expirado: z.boolean(),
  fechaExpiracion: z.iso.datetime().nullish(),
});

export const adminAnnouncementListDtoSchema = z.array(adminAnnouncementDtoSchema);
