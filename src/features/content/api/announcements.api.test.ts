import { toCreateAnnouncementDto } from './announcements.api';

describe('toCreateAnnouncementDto', () => {
  it('traduce el formulario a los campos en español de la API', () => {
    expect(toCreateAnnouncementDto({ title: ' Jornada ', description: ' Sábado ' })).toEqual({
      titulo: 'Jornada',
      descripcion: 'Sábado',
    });
  });
});
