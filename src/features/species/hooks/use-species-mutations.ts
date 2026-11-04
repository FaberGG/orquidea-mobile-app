import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

import { createSpecies, type SaveSpeciesProgress, updateSpecies } from '../api';
import { SPECIES_MESSAGES, speciesKeys } from '../constants';
import { type SpeciesInput } from '../types';

/**
 * En desarrollo, registra en la terminal de Metro por qué falló el guardado: el estado HTTP, el cuerpo
 * de la respuesta y, si no hubo respuesta, el tipo de fallo. Nada de esto llega al usuario.
 */
function logSaveFailure(action: string, error: unknown, input: SpeciesInput) {
  if (!__DEV__) return;
  const photos = input.newPhotos.map((photo) => ({
    uri: photo.uri,
    fileName: photo.fileName,
    mimeType: photo.mimeType,
    fileSize: photo.fileSize,
  }));
  if (isApiError(error)) {
    console.error(`[fichas] ${action} falló`, {
      status: error.status,
      kind: error.kind,
      path: error.path,
      serverMessage: error.serverMessage,
      body: error.body,
      photos,
      removedPhotoIds: input.removedPhotoIds,
    });
    return;
  }
  console.error(`[fichas] ${action} falló (sin respuesta del servidor)`, error, { photos });
}

/**
 * HU-7: crea la ficha; al terminar, el listado de su categoría debe reflejarla. Resuelve con las fotos que
 * no se pudieron subir (`pendingPhotos`), porque la ficha ya existe aunque falle una foto adicional.
 */
export function useCreateSpecies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SpeciesInput) => createSpecies(input),
    onError: (error, input) => logSaveFailure('crear', error, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: speciesKeys.all }),
  });
}

export type UpdateSpeciesVariables = {
  input: SpeciesInput;
  /** Avisa qué fotos ya se guardaron, para no repetirlas si un paso posterior falla. */
  progress?: SaveSpeciesProgress;
};

/**
 * HU-8: edita la ficha; invalida el detalle y los listados. También al fallar, porque los pasos previos
 * (texto, fotos quitadas o agregadas) pudieron quedar guardados.
 */
export function useUpdateSpecies(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, progress }: UpdateSpeciesVariables) => updateSpecies(id, input, progress),
    onError: (error, { input }) => logSaveFailure('editar', error, input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: speciesKeys.all }),
  });
}

/**
 * Mensaje para un fallo al guardar. Se prefiere el `mensaje` del servidor (409, 413, 400); los textos
 * locales son respaldo (CODIGO §10).
 */
export function getSpeciesSaveErrorMessage(error: unknown): string {
  if (isApiError(error) && error.serverMessage) return error.serverMessage;
  if (isApiError(error) && error.status === 409) return SPECIES_MESSAGES.duplicateScientificName;
  if (isApiError(error) && error.status === 413) return SPECIES_MESSAGES.imageTooLarge;
  return SPECIES_MESSAGES.saveError;
}
