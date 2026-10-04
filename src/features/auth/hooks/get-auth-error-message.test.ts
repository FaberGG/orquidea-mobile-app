import { ApiError } from '@/lib/api';

import { AUTH_MESSAGES } from '../constants';
import { getLoginErrorMessage } from './get-auth-error-message';

const path = '/api/autenticacion/iniciar-sesion';

describe('getLoginErrorMessage', () => {
  it('muestra el mensaje del servidor en errores 4xx', () => {
    const error = new ApiError({ status: 401, kind: 'http', path, serverMessage: 'Del servidor' });
    expect(getLoginErrorMessage(error)).toBe('Del servidor');
  });

  it('usa "Correo o contraseña incorrectos." si un 401 llega sin mensaje', () => {
    expect(getLoginErrorMessage(new ApiError({ status: 401, kind: 'http', path }))).toBe(
      AUTH_MESSAGES.invalidCredentials,
    );
  });

  it('usa "Ambos campos son obligatorios." si un 400 llega sin mensaje', () => {
    expect(getLoginErrorMessage(new ApiError({ status: 400, kind: 'http', path }))).toBe(
      AUTH_MESSAGES.requiredFields,
    );
  });

  it.each(['network', 'timeout'] as const)('usa el mensaje de conexión ante %s', (kind) => {
    expect(getLoginErrorMessage(new ApiError({ status: 0, kind, path }))).toBe(
      AUTH_MESSAGES.networkError,
    );
  });

  it('no muestra mensajes del servidor en errores 5xx', () => {
    const error = new ApiError({ status: 500, kind: 'http', path, serverMessage: 'NullPointer' });
    expect(getLoginErrorMessage(error)).toBe(AUTH_MESSAGES.unexpectedError);
  });

  it('usa el mensaje genérico ante errores que no son de la API', () => {
    expect(getLoginErrorMessage(new Error('zod'))).toBe(AUTH_MESSAGES.unexpectedError);
  });
});
