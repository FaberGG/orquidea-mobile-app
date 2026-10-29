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
    photoUrl: parsed.fotos?.[0]?.url || parsed.urlFoto || null,
    photos: toSpeciesPhotos(parsed.fotos, parsed.urlFoto),
  };
}

/**
 * `fotos` (v2.0) en orden. Si la API aún no la envía, se usa `urlFoto` como única foto, sin id (no se puede
 * quitar por separado).
 */
function toSpeciesPhotos(
  photos: { id: string; url: string }[] | null | undefined,
  principalUrl: string | null | undefined,
): Species['photos'] {
  if (photos) return photos.map((photo) => ({ id: photo.id, url: photo.url }));
  return principalUrl ? [{ id: null, url: principalUrl }] : [];
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

/** `multipart/form-data` solo de texto (`PUT` de HU-8): las fotos tienen sus propios endpoints. */
export function toSpeciesFormData(input: SpeciesInput): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(toSpeciesFields(input))) data.append(name, value);
  return data;
}
