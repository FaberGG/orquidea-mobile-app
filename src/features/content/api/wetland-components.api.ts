import { apiClient, uploadMultipart } from '@/lib/api';

import {
  type NewComponentPhoto,
  type WetlandComponent,
  type WetlandComponentChanges,
} from '../types';
import {
  toUpdateWetlandComponentDto,
  toWetlandComponent,
  toWetlandComponentList,
} from './wetland-components.mappers';

const COMPONENTS_PATH = '/api/componentes';

const componentPath = (type: string) => `${COMPONENTS_PATH}/${encodeURIComponent(type)}`;

/** HU-14: `GET /api/componentes`. Público (sin token). */
export async function listWetlandComponents(): Promise<WetlandComponent[]> {
  const response = await apiClient.get<unknown>(COMPONENTS_PATH, { authenticated: false });
  return toWetlandComponentList(response);
}

/** HU-14: `GET /api/componentes/{tipo}`. Público. Un tipo que no existe responde con error. */
export async function getWetlandComponent(type: string): Promise<WetlandComponent> {
  const response = await apiClient.get<unknown>(componentPath(type), { authenticated: false });
  return toWetlandComponent(response);
}

/** HU-15: `PUT /api/componentes/{tipo}` con `{ nombre, descripcion }`. Solo admin y superadmin. */
export async function updateWetlandComponentText(
  type: string,
  changes: Pick<WetlandComponentChanges, 'name' | 'description'>,
): Promise<void> {
  await apiClient.put<unknown>(componentPath(type), {
    body: toUpdateWetlandComponentDto(changes),
  });
}

/**
 * HU-15: `POST /api/componentes/{tipo}/fotos` (`multipart/form-data`, campo `foto`). La API acepta
 * jpg y png de hasta 10 MB (400 / 413) y máximo 10 fotos por componente (409).
 */
export async function addWetlandComponentPhoto(
  type: string,
  photo: NewComponentPhoto,
): Promise<void> {
  await uploadMultipart(
    'POST',
    `${componentPath(type)}/fotos`,
    {},
    { uri: photo.uri, mimeType: photo.mimeType },
    'foto',
  );
}

/** HU-15: `DELETE /api/componentes/{tipo}/fotos/{idFoto}`. */
export async function deleteWetlandComponentPhoto(type: string, photoId: string): Promise<void> {
  await apiClient.delete<unknown>(`${componentPath(type)}/fotos/${encodeURIComponent(photoId)}`);
}

export type SaveProgressListeners = {
  /** Se llama cuando una foto ya se eliminó en el servidor. */
  onPhotoRemoved?: (photoId: string) => void;
  /** Se llama cuando una foto nueva ya se subió. */
  onPhotoAdded?: (photo: NewComponentPhoto) => void;
};

/**
 * HU-15 (GUARDAR CAMBIOS): la API recibe el texto y cada foto por separado, así que se aplican en
 * orden: texto, fotos quitadas (primero, para no chocar con el límite de 10) y fotos nuevas. Si un
 * paso falla, los anteriores ya quedaron guardados: los `listeners` avisan cuáles, para no repetirlos
 * al reintentar. Al final se vuelve a leer el componente para mostrar su estado real.
 */
export async function saveWetlandComponentChanges(
  type: string,
  changes: WetlandComponentChanges,
  listeners: SaveProgressListeners = {},
): Promise<WetlandComponent> {
  await updateWetlandComponentText(type, changes);
  for (const photoId of changes.removedPhotoIds) {
    await deleteWetlandComponentPhoto(type, photoId);
    listeners.onPhotoRemoved?.(photoId);
  }
  for (const photo of changes.newPhotos) {
    await addWetlandComponentPhoto(type, photo);
    listeners.onPhotoAdded?.(photo);
  }
  return getWetlandComponent(type);
}
