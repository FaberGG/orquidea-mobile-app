import { ApiError } from '@/lib/api';

import { CONTENT_MESSAGES } from '../constants';
import { getPublishAnnouncementErrorMessage } from './use-create-announcement';

const path = '/api/anuncios';

describe('getPublishAnnouncementErrorMessage', () => {
  it('muestra el mensaje del servidor en errores 4xx', () => {
    const error = new ApiError({ status: 400, kind: 'http', path, serverMessage: 'Del servidor' });
    expect(getPublishAnnouncementErrorMessage(error)).toBe('Del servidor');
  });

  it('CA2: un 400 sin mensaje usa el texto del criterio', () => {
    expect(
      getPublishAnnouncementErrorMessage(new ApiError({ status: 400, kind: 'http', path })),
    ).toBe(CONTENT_MESSAGES.announcementRequiredFields);
  });

  it('un 403 sin mensaje avisa que no hay permisos', () => {
    expect(
      getPublishAnnouncementErrorMessage(new ApiError({ status: 403, kind: 'http', path })),
    ).toBe(CONTENT_MESSAGES.forbidden);
  });

  it.each(['network', 'timeout'] as const)('usa el mensaje de conexión ante %s', (kind) => {
    expect(getPublishAnnouncementErrorMessage(new ApiError({ status: 0, kind, path }))).toBe(
      CONTENT_MESSAGES.networkError,
    );
  });

  it('no muestra mensajes del servidor en errores 5xx', () => {
    const error = new ApiError({ status: 500, kind: 'http', path, serverMessage: 'NullPointer' });
    expect(getPublishAnnouncementErrorMessage(error)).toBe(CONTENT_MESSAGES.unexpectedError);
  });
});
