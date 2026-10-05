import { taxonDtoSchema, taxonListDtoSchema } from '../schemas/species-dto.schema';
import { type Species, type SpeciesCategory, type SpeciesInput } from '../types';

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

const CATEGORY_TO_API: Record<SpeciesCategory, 'AVE' | 'PLANTA' | 'INSECTO'> = {
  bird: 'AVE',
  plant: 'PLANTA',
  insect: 'INSECTO',
};

/** Campos de texto de `TaxonRequest`, ya sin espacios sobrantes. */
export function toSpeciesFields(input: SpeciesInput): Record<string, string> {
  return {
    categoria: CATEGORY_TO_API[input.category],
    vernacularName: input.vernacularName.trim(),
    scientificName: input.scientificName.trim(),
    order: input.order.trim(),
    family: input.family.trim(),
    genus: input.genus.trim(),
    alimentacion: input.diet.trim(),
    rolEnHumedal: input.wetlandRole.trim(),
    estadoConservacion: input.conservationStatus,
  };
}

/** `multipart/form-data` solo de texto, para editar sin cambiar la foto. */
export function toSpeciesFormData(input: SpeciesInput): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(toSpeciesFields(input))) data.append(name, value);
  return data;
}
