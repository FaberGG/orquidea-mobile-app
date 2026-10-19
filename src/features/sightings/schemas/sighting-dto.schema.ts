import { z } from 'zod';

// Validación de `OccurrenceDto` y su página antes de mapearlos (CODIGO §2: los datos externos se
// validan). Ver docs/api/reportes-avistamiento.md.

export const KINGDOM_CODES = ['ANIMALIA', 'PLANTAE', 'FUNGI', 'DESCONOCIDO'] as const;

export const occurrenceDtoSchema = z.object({
  id: z.string().min(1),
  occurrenceRemarks: z.string(),
  kingdom: z.enum(KINGDOM_CODES),
  vernacularName: z.string().nullish(),
  decimalLatitude: z.number().nullish(),
  decimalLongitude: z.number().nullish(),
  recordedBy: z.string(),
  urlFoto: z.string().nullish(),
  estado: z.enum(['PENDIENTE', 'APROBADO', 'RECHAZADO']),
  fechaCreacion: z.string(),
  fechaRevision: z.string().nullish(),
});

export const occurrencePageDtoSchema = z.object({
  contenido: z.array(occurrenceDtoSchema),
  pagina: z.number().int(),
  tamano: z.number().int(),
  totalElementos: z.number().int(),
  totalPaginas: z.number().int(),
});

export type OccurrenceDto = z.infer<typeof occurrenceDtoSchema>;
export type KingdomCode = (typeof KINGDOM_CODES)[number];
