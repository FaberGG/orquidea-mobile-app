import { z } from 'zod';

import { CONSERVATION_CODES } from '../constants';

// Validación de `TaxonDto` antes de mapearlo (CODIGO §2: los datos externos se validan).
// Los textos opcionales llegan como `null` o vacíos cuando el backend no los tiene.

export const taxonDtoSchema = z.object({
  id: z.string().min(1),
  categoria: z.enum(['AVE', 'PLANTA', 'INSECTO']),
  order: z.string().nullish(),
  family: z.string().nullish(),
  genus: z.string().nullish(),
  scientificName: z.string(),
  vernacularName: z.string(),
  alimentacion: z.string().nullish(),
  rolEnHumedal: z.string().nullish(),
  estadoConservacion: z.enum(CONSERVATION_CODES),
  urlFoto: z.string().nullish(),
});

export const taxonListDtoSchema = z.array(taxonDtoSchema);
