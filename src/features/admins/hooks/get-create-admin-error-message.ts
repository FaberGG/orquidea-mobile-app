import { isApiError } from '@/lib/api';

import { ADMIN_MESSAGES } from '../constants';

/** Muestra el mensaje de negocio de la API; nunca expone errores técnicos. */
export function getCreateAdminErrorMessage(error: unknown): string {
  if (!isApiError(error)) return ADMIN_MESSAGES.unexpectedError;
  if (error.kind !== 'http') return ADMIN_MESSAGES.networkError;
  if (error.status >= 400 && error.status < 500) {
    if (error.status === 409 && error.serverMessage?.includes('Administradores activos exceden')) {
      return ADMIN_MESSAGES.limitReached;
    }
    if (error.serverMessage) return error.serverMessage;

    if (error.status === 400) return ADMIN_MESSAGES.requiredFields;
  }
  return ADMIN_MESSAGES.unexpectedError;
}
