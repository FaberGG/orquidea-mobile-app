import { apiClient, uploadMultipart } from '@/lib/api';

import { SPECIES_CATEGORY_FILTERS, type CategoryFilter } from '../constants';
import { type Species, type SpeciesInput } from '../types';
import { toSpecies, toSpeciesFields, toSpeciesFormData, toSpeciesList } from './species.mappers';

const SPECIES_PATH = '/api/fichas-taxonomicas';

/** Envía la ficha: con foto por subida nativa; sin foto, como `multipart` de texto. */
async function sendSpecies(
  method: 'POST' | 'PUT',
  path: string,
  input: SpeciesInput,
): Promise<unknown> {
  if (input.photo) {
    return uploadMultipart(
      method,
      path,
      toSpeciesFields(input),
      { uri: input.photo.uri, mimeType: input.photo.mimeType },
      'foto',
    );
  }
  const formData = toSpeciesFormData(input);
  return method === 'POST'
    ? apiClient.post<unknown>(path, { formData })
    : apiClient.put<unknown>(path, { formData });
}

/**
 * HU-10: `GET /api/fichas-taxonomicas?categoria=`. Público (sin token) y sin paginación.
 * Sin categoría (`all`) no envía el parámetro.
 */
export async function listSpecies(category: CategoryFilter): Promise<Species[]> {
  const filter = SPECIES_CATEGORY_FILTERS.find((item) => item.id === category);
  const apiValue = filter && 'apiValue' in filter ? filter.apiValue : undefined;
  const response = await apiClient.get<unknown>('/api/fichas-taxonomicas', {
    query: { categoria: apiValue },
    authenticated: false,
  });
  return toSpeciesList(response);
}

/** HU-10 (detalle): `GET /api/fichas-taxonomicas/{id}`. `404` = la ficha no existe. */
export async function getSpecies(id: string): Promise<Species> {
  const response = await apiClient.get<unknown>(
    `/api/fichas-taxonomicas/${encodeURIComponent(id)}`,
    {
      authenticated: false,
    },
  );
  return toSpecies(response);
}

/** HU-7: `POST /api/fichas-taxonomicas`. `409` = nombre científico duplicado; `413` = foto grande. */
export async function createSpecies(input: SpeciesInput): Promise<Species> {
  return toSpecies(await sendSpecies('POST', SPECIES_PATH, input));
}

/** HU-8: `PUT /api/fichas-taxonomicas/{id}`. Sin foto nueva se conserva la actual. */
export async function updateSpecies(id: string, input: SpeciesInput): Promise<Species> {
  const path = `${SPECIES_PATH}/${encodeURIComponent(id)}`;
  return toSpecies(await sendSpecies('PUT', path, input));
}
