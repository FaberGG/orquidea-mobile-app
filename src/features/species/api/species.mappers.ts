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

/**
 * Arma el `multipart/form-data` de `TaxonRequest`. La foto va como archivo con su URI local; sin foto
 * no se envía el campo y la API conserva la actual al editar.
 */
export function toSpeciesFormData(input: SpeciesInput): FormData {
  const data = new FormData();
  data.append('categoria', CATEGORY_TO_API[input.category]);
  data.append('vernacularName', input.vernacularName.trim());
  data.append('scientificName', input.scientificName.trim());
  data.append('order', input.order.trim());
  data.append('family', input.family.trim());
  data.append('genus', input.genus.trim());
  data.append('alimentacion', input.diet.trim());
  data.append('rolEnHumedal', input.wetlandRole.trim());
  data.append('estadoConservacion', input.conservationStatus);
  if (input.photo) {
    // En React Native un archivo en FormData es `{ uri, name, type }`, no un Blob.
    data.append('foto', {
      uri: input.photo.uri,
      name: input.photo.fileName ?? 'foto.jpg',
      type: input.photo.mimeType,
    } as unknown as Blob);
  }
  return data;
}
