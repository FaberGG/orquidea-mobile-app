import { taxonDtoSchema, taxonListDtoSchema } from '../schemas/species-dto.schema';
import { type Species, type SpeciesCategory } from '../types';

const CATEGORY_FROM_API: Record<'AVE' | 'PLANTA' | 'INSECTO', SpeciesCategory> = {
  AVE: 'bird',
  PLANTA: 'plant',
  INSECTO: 'insect',
};

/** Valida y traduce un `TaxonDto` a `Species`. Lanza si la respuesta no cumple el contrato. */
export function toSpecies(dto: unknown): Species {
  const parsed = taxonDtoSchema.parse(dto);
  return {
    id: parsed.id,
    category: CATEGORY_FROM_API[parsed.categoria],
    order: parsed.order || null,
    family: parsed.family || null,
    genus: parsed.genus || null,
    scientificName: parsed.scientificName,
    vernacularName: parsed.vernacularName,
    diet: parsed.alimentacion || null,
    wetlandRole: parsed.rolEnHumedal || null,
    conservationStatus: parsed.estadoConservacion,
    photoUrl: parsed.urlFoto || null,
  };
}

/** Valida y traduce la lista de `GET /api/fichas-taxonomicas`. */
export function toSpeciesList(dto: unknown): Species[] {
  return taxonListDtoSchema.parse(dto).map(toSpecies);
}
