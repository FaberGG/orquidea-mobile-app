import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

import { createWetlandComponent, type CreateWetlandComponentInput } from '../api';
import { CONTENT_MESSAGES, wetlandComponentKeys } from '../constants';

/** HU-25: crea el componente y sube sus fotos; refresca la sección de componentes (HU-14). */
export function useCreateWetlandComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWetlandComponentInput) => createWetlandComponent(input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: wetlandComponentKeys.all }),
  });
}

/** Mensaje si falla crear el componente: el del servidor en 4xx; respaldos locales (CODIGO §10). */
export function getCreateWetlandComponentErrorMessage(error: unknown): string {
  if (!isApiError(error)) return CONTENT_MESSAGES.unexpectedError;
  if (error.kind !== 'http') return CONTENT_MESSAGES.networkError;
  if (error.status >= 400 && error.status < 500 && error.serverMessage) return error.serverMessage;
  if (error.status === 400) return CONTENT_MESSAGES.componentRequiredFields;
  if (error.status === 403) return CONTENT_MESSAGES.componentCreateForbidden;
  if (error.status === 409) return CONTENT_MESSAGES.componentNameDuplicated;
  return CONTENT_MESSAGES.unexpectedError;
}
