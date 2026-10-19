import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

import { saveWetlandComponentChanges, type SaveProgressListeners } from '../api';
import { CONTENT_MESSAGES, wetlandComponentKeys } from '../constants';
import { type WetlandComponentChanges } from '../types';

type SaveVariables = {
  changes: WetlandComponentChanges;
  listeners?: SaveProgressListeners;
};

/**
 * HU-15: guarda el texto y las fotos de un componente. Al terminar (bien o mal) se invalidan el
 * listado y el detalle, porque un fallo a mitad de camino deja guardados los pasos anteriores.
 */
export function useSaveWetlandComponent(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ changes, listeners }: SaveVariables) =>
      saveWetlandComponentChanges(type, changes, listeners),
    onSuccess: (component) => {
      queryClient.setQueryData(wetlandComponentKeys.detail(type), component);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: wetlandComponentKeys.all }),
  });
}

/**
 * Mensaje para un fallo al guardar. Se prefiere el mensaje del servidor en errores 4xx (por ejemplo
 * "El formato de la imagen no es válido."); los textos locales son respaldo (CODIGO §10).
 */
export function getSaveWetlandComponentErrorMessage(error: unknown): string {
  if (!isApiError(error)) return CONTENT_MESSAGES.unexpectedError;
  if (error.kind !== 'http') return CONTENT_MESSAGES.networkError;
  if (error.status >= 400 && error.status < 500 && error.serverMessage) return error.serverMessage;
  if (error.status === 403) return CONTENT_MESSAGES.componentForbidden;
  if (error.status === 409) return CONTENT_MESSAGES.photoLimitReached;
  if (error.status === 413) return CONTENT_MESSAGES.photoTooLarge;
  return CONTENT_MESSAGES.unexpectedError;
}
