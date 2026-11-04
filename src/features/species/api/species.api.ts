import { apiClient, uploadMultipart } from '@/lib/api';

import { SPECIES_CATEGORY_FILTERS, type CategoryFilter } from '../constants';
import { type SpeciesPhoto } from '../schemas/species-form.schema';
import { type Species, type SpeciesInput } from '../types';
import { toSpecies, toSpeciesFields, toSpeciesFormData, toSpeciesList } from './species.mappers';

const SPECIES_PATH = '/api/fichas-taxonomicas';

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
export async function getSpecies(
  id: string,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<Species> {
  const response = await apiClient.get<unknown>(
    `/api/fichas-taxonomicas/${encodeURIComponent(id)}`,
    {
      authenticated: false,
      signal: options.signal,
      timeoutMs: options.timeoutMs,
    },
  );
  return toSpecies(response);
}

/** HU-11: descarga el PNG original; el backend exige permisos administrativos. */
export async function getSpeciesQr(id: string, signal?: AbortSignal): Promise<Uint8Array> {
  const data = await apiClient.getBinary(`${SPECIES_PATH}/${encodeURIComponent(id)}/qr`, {
    accept: 'image/png, application/json',
    signal,
  });
  const bytes = new Uint8Array(data);
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((byte, index) => bytes[index] === byte)) {
    throw new Error('La respuesta de descarga no es una imagen PNG.');
  }
  return bytes;
}

const speciesPath = (id: string) => `${SPECIES_PATH}/${encodeURIComponent(id)}`;

/** Resultado de crear: si alguna foto adicional no se subió, la ficha ya existe y quedan pendientes. */
export type CreateSpeciesResult = {
  species: Species;
  /** Fotos que no se subieron (la que falló y las siguientes). Vacío si todo se guardó. */
  pendingPhotos: SpeciesPhoto[];
};

/**
 * HU-7 (v2.0, SCRUM-47; contrato inferido en docs/api/fichas-varias-fotos.md).
 *
 * `uploadMultipart` (subida nativa de Expo) envía un archivo por petición, así que la ficha se crea con la
 * primera foto en el campo `fotos` y el resto se agrega en orden con `POST /{id}/fotos`. Si una foto
 * adicional falla, la ficha ya existe: se devuelve con las fotos pendientes en lugar de lanzar el error, para
 * no reintentar la creación (respondería `409` por nombre científico duplicado).
 * `409` = nombre científico duplicado; `413` = foto grande.
 */
export async function createSpecies(input: SpeciesInput): Promise<CreateSpeciesResult> {
  const [principal, ...others] = input.newPhotos;
  if (!principal) throw new Error('Crear una ficha requiere al menos una foto.');

  let species = toSpecies(
    await uploadMultipart(
      'POST',
      SPECIES_PATH,
      toSpeciesFields(input),
      { uri: principal.uri, mimeType: principal.mimeType },
      'fotos',
    ),
  );
  for (const [index, photo] of others.entries()) {
    try {
      species = await addSpeciesPhoto(species.id, photo);
    } catch {
      return { species, pendingPhotos: others.slice(index) };
    }
  }
  return { species, pendingPhotos: [] };
}

/**
 * HU-7 v2.0: `POST /api/fichas-taxonomicas/{id}/fotos` (`multipart/form-data`, campo `foto`), como en los
 * componentes del humedal. Agrega la foto al final y devuelve la ficha. `409` = ya tiene 10 fotos.
 */
export async function addSpeciesPhoto(id: string, photo: SpeciesPhoto): Promise<Species> {
  return toSpecies(
    await uploadMultipart(
      'POST',
      `${speciesPath(id)}/fotos`,
      {},
      { uri: photo.uri, mimeType: photo.mimeType },
      'foto',
    ),
  );
}

/** HU-7 v2.0: `DELETE /api/fichas-taxonomicas/{id}/fotos/{idFoto}`. `409` = es la única foto. */
export async function deleteSpeciesPhoto(id: string, photoId: string): Promise<void> {
  await apiClient.delete<unknown>(`${speciesPath(id)}/fotos/${encodeURIComponent(photoId)}`);
}

export type SaveSpeciesProgress = {
  /** Una foto guardada ya se quitó en el servidor. */
  onPhotoRemoved?: (photoId: string) => void;
  /** Una foto nueva ya se subió. */
  onPhotoAdded?: (photo: SpeciesPhoto) => void;
};

/**
 * HU-8 (GUARDAR CAMBIOS). La API recibe el texto y cada foto por separado, así que se aplican en orden:
 * texto (`PUT`, sin archivos) y luego cambios de fotos. Si se reemplazan todas las fotos existentes, se
 * mantiene siempre al menos una en el servidor (el backend no permite quedar temporalmente sin fotos).
 * Si un paso falla, los anteriores ya quedaron guardados: `progress` avisa cuáles, para no repetirlos al
 * reintentar. Al final se vuelve a leer la ficha para mostrar su estado real.
 */
export async function updateSpecies(
  id: string,
  input: SpeciesInput,
  progress: SaveSpeciesProgress = {},
): Promise<Species> {
  const updated = toSpecies(
    await apiClient.put<unknown>(speciesPath(id), { formData: toSpeciesFormData(input) }),
  );

  const removablePhotoIds = updated.photos
    .map((photo) => photo.id)
    .filter((photoId): photoId is string => photoId !== null);
  const photosToRemove = removablePhotoIds.filter((photoId) =>
    input.removedPhotoIds.includes(photoId),
  );
  const remainingAfterRemovals = updated.photos.length - photosToRemove.length;
  const photosToAdd = [...input.newPhotos];

  const removePhoto = async (photoId: string) => {
    await deleteSpeciesPhoto(id, photoId);
    progress.onPhotoRemoved?.(photoId);
  };
  const addPhoto = async (photo: SpeciesPhoto) => {
    await addSpeciesPhoto(id, photo);
    progress.onPhotoAdded?.(photo);
  };

  if (remainingAfterRemovals === 0 && photosToRemove.length > 0) {
    const replacement = photosToAdd.shift();
    if (!replacement) {
      throw new Error('No se puede quitar la única foto de una ficha sin agregar otra.');
    }
    if (updated.photos.length === 10) {
      for (const photoId of photosToRemove.slice(0, -1)) {
        await removePhoto(photoId);
      }
      await addPhoto(replacement);
      await removePhoto(photosToRemove[photosToRemove.length - 1]);
    } else {
      await addPhoto(replacement);
      for (const photoId of photosToRemove) {
        await removePhoto(photoId);
      }
    }
  } else {
    for (const photoId of photosToRemove) {
      await removePhoto(photoId);
    }
  }
  for (const photo of photosToAdd) {
    await addPhoto(photo);
  }
  return getSpecies(id);
}
