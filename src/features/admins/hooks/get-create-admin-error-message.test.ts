import { ApiError } from '@/lib/api';

import { ADMIN_MESSAGES } from '../constants';
import { getCreateAdminErrorMessage } from './get-create-admin-error-message';

const path = '/api/administradores/registrarAdmin';

describe('errores de creación de administrador', () => {
  it('muestra el mensaje exacto de la API para duplicado y límite', () => {
    for (const message of [ADMIN_MESSAGES.duplicateEmail, ADMIN_MESSAGES.limitReached]) {
      const error = new ApiError({ status: 409, kind: 'http', path, serverMessage: message });
      expect(getCreateAdminErrorMessage(error)).toBe(message);
    }
  });

  it('no adivina la causa de un 409 sin mensaje', () => {
    const error = new ApiError({ status: 409, kind: 'http', path });
    expect(getCreateAdminErrorMessage(error)).toBe(ADMIN_MESSAGES.unexpectedError);
  });

  it('traduce el límite que comunica el backend a un texto claro', () => {
    const error = new ApiError({
      status: 409,
      kind: 'http',
      path,
      serverMessage: 'Administradores activos exceden el límite permitido: 3',
    });
    expect(getCreateAdminErrorMessage(error)).toBe(ADMIN_MESSAGES.limitReached);
  });

  it('presenta un mensaje seguro cuando no hay conexión', () => {
    const error = new ApiError({ status: 0, kind: 'network', path });
    expect(getCreateAdminErrorMessage(error)).toBe(ADMIN_MESSAGES.networkError);
  });
});
