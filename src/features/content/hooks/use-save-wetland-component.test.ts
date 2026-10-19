import { ApiError } from '@/lib/api';

import { CONTENT_MESSAGES } from '../constants';
import { getSaveWetlandComponentErrorMessage } from './use-save-wetland-component';

const httpError = (status: number, serverMessage?: string) =>
  new ApiError({ status, kind: 'http', path: '/api/componentes/AVES', serverMessage });

describe('getSaveWetlandComponentErrorMessage', () => {
  it('prefiere el mensaje del servidor en errores 4xx', () => {
    expect(
      getSaveWetlandComponentErrorMessage(httpError(400, 'El formato de la imagen no es válido.')),
    ).toBe('El formato de la imagen no es válido.');
  });

  it.each([
    [403, CONTENT_MESSAGES.componentForbidden],
    [409, CONTENT_MESSAGES.photoLimitReached],
    [413, CONTENT_MESSAGES.photoTooLarge],
    [500, CONTENT_MESSAGES.unexpectedError],
  ])('sin mensaje del servidor, %i → texto local', (status, expected) => {
    expect(getSaveWetlandComponentErrorMessage(httpError(status))).toBe(expected);
  });

  it('distingue la falta de conexión', () => {
    expect(
      getSaveWetlandComponentErrorMessage(
        new ApiError({ status: 0, kind: 'network', path: '/api/componentes/AVES' }),
      ),
    ).toBe(CONTENT_MESSAGES.networkError);
  });

  it('un error desconocido usa el mensaje genérico', () => {
    expect(getSaveWetlandComponentErrorMessage(new Error('x'))).toBe(
      CONTENT_MESSAGES.unexpectedError,
    );
  });
});
