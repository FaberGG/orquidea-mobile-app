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

/**
 * Mensaje a mostrar cuando falla el registro. `409` siempre muestra el texto del criterio de
 * aceptación (HU-2 CA2): el contrato documenta otro texto ("El correo electrónico ya está registrado.").
 */
export function getRegisterErrorMessage(error: unknown): string {
  if (!isApiError(error)) return AUTH_MESSAGES.unexpectedError;
  if (error.kind !== 'http') return AUTH_MESSAGES.networkError;
  if (error.status === 409) return AUTH_MESSAGES.emailAlreadyRegistered;
  if (error.status >= 400 && error.status < 500) {
    return error.serverMessage ?? AUTH_MESSAGES.registerRequiredFields;
  }
  return AUTH_MESSAGES.unexpectedError;
}
