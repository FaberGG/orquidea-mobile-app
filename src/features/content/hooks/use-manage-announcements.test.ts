import { ApiError } from '@/lib/api';

import { CONTENT_MESSAGES } from '../constants';
import { getAnnouncementVisibilityErrorMessage } from './use-manage-announcements';

const httpError = (status: number, serverMessage?: string) =>
  new ApiError({ status, kind: 'http', path: '/api/anuncios/1/mostrar', serverMessage });

describe('getAnnouncementVisibilityErrorMessage (HU-24)', () => {
  it('prefiere el mensaje del servidor', () => {
    expect(
      getAnnouncementVisibilityErrorMessage(
        httpError(409, 'No puedes mostrar un anuncio que ya expiró.'),
      ),
    ).toBe('No puedes mostrar un anuncio que ya expiró.');
  });

  it.each([
    [403, CONTENT_MESSAGES.announcementsManageForbidden],
    [404, CONTENT_MESSAGES.announcementNotFound],
    [409, CONTENT_MESSAGES.announcementExpiredCannotShow],
    [500, CONTENT_MESSAGES.unexpectedError],
  ])('sin mensaje del servidor, %i → texto local', (status, expected) => {
    expect(getAnnouncementVisibilityErrorMessage(httpError(status))).toBe(expected);
  });

  it('distingue la falta de conexión', () => {
    expect(
      getAnnouncementVisibilityErrorMessage(
        new ApiError({ status: 0, kind: 'network', path: '/api/anuncios/1/ocultar' }),
      ),
    ).toBe(CONTENT_MESSAGES.networkError);
  });
});
