import { isApiError } from '@/lib/api';

import { AUTH_MESSAGES } from '../constants';

/**
 * Mensaje a mostrar cuando falla el inicio de sesión (CODIGO §10):
 * `mensaje` del servidor en errores 4xx; si falta, el del criterio de aceptación según el estado;
 * mensajes de respaldo para red, timeout, 5xx o errores inesperados.
 */
export function getLoginErrorMessage(error: unknown): string {
  if (!isApiError(error)) return AUTH_MESSAGES.unexpectedError;
  if (error.kind !== 'http') return AUTH_MESSAGES.networkError;
  if (error.status >= 400 && error.status < 500) {
    if (error.serverMessage) return error.serverMessage;
    if (error.status === 401) return AUTH_MESSAGES.invalidCredentials;
    if (error.status === 400) return AUTH_MESSAGES.requiredFields;
  }
  return AUTH_MESSAGES.unexpectedError;
}
