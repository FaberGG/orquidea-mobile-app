import { ApiError } from '@/lib/api';

import { CONTENT_MESSAGES } from '../constants';
import { getCreateWetlandComponentErrorMessage } from './use-create-wetland-component';

const httpError = (status: number, serverMessage?: string) =>
  new ApiError({ status, kind: 'http', path: '/api/componentes', serverMessage });

describe('getCreateWetlandComponentErrorMessage (HU-25)', () => {
  it('CA3: muestra el mensaje del servidor para un nombre duplicado', () => {
    expect(
      getCreateWetlandComponentErrorMessage(
        httpError(409, 'Ya existe un componente con ese nombre.'),
      ),
    ).toBe('Ya existe un componente con ese nombre.');
  });

  it.each([
    [400, CONTENT_MESSAGES.componentRequiredFields],
    [403, CONTENT_MESSAGES.componentCreateForbidden],
    [409, CONTENT_MESSAGES.componentNameDuplicated],
    [500, CONTENT_MESSAGES.unexpectedError],
  ])('sin mensaje del servidor, %i → texto local', (status, expected) => {
    expect(getCreateWetlandComponentErrorMessage(httpError(status))).toBe(expected);
  });

  it('distingue la falta de conexión', () => {
    expect(
      getCreateWetlandComponentErrorMessage(
        new ApiError({ status: 0, kind: 'network', path: '/api/componentes' }),
      ),
    ).toBe(CONTENT_MESSAGES.networkError);
  });
});
