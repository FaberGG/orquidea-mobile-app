import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

import { createSpecies, updateSpecies } from '../api';
import { SPECIES_MESSAGES, speciesKeys } from '../constants';
import { type SpeciesInput } from '../types';

/** HU-7: crea la ficha; al terminar, el listado de su categoría debe reflejarla. */
export function useCreateSpecies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SpeciesInput) => createSpecies(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: speciesKeys.all }),
  });
}

/** HU-8: edita la ficha; invalida el detalle y los listados. */
export function useUpdateSpecies(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SpeciesInput) => updateSpecies(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: speciesKeys.all }),
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
