import { z } from 'zod';

// Validación de `EstacionDto` antes de mapearlo (CODIGO §2). Contrato inferido: docs/api/estaciones.md.

export const stationSpeciesDtoSchema = z.object({
  id: z.string().min(1),
  vernacularName: z.string(),
  urlFoto: z.string().nullish(),
});

export const stationDtoSchema = z.object({
  id: z.string().min(1),
  nombre: z.string(),
  descripcion: z.string().nullish(),
  urlFoto: z.string().nullish(),
  decimalLatitude: z.number(),
  decimalLongitude: z.number(),
  fichas: z.array(stationSpeciesDtoSchema).nullish(),
});

export const stationListDtoSchema = z.array(stationDtoSchema);
