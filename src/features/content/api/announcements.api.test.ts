import { toCreateAnnouncementDto } from './announcements.api';

describe('toCreateAnnouncementDto', () => {
  it('traduce el formulario a los campos en español de la API (HU-16 CA3)', () => {
    expect(
      toCreateAnnouncementDto({
        title: ' Jornada ',
        description: ' Sábado ',
        priority: 'high',
        expiresAt: null,
      }),
    ).toEqual({ titulo: 'Jornada', descripcion: 'Sábado', prioridad: 'ALTA' });
  });

  it('envía la fecha de finalización como instante ISO en UTC (HU-23)', () => {
    expect(
      toCreateAnnouncementDto({
        title: 'Jornada',
        description: 'Texto',
        priority: 'low',
        expiresAt: new Date('2026-12-31T23:59:00Z'),
      }),
    ).toEqual({
      titulo: 'Jornada',
      descripcion: 'Texto',
      prioridad: 'BAJA',
      fechaExpiracion: '2026-12-31T23:59:00.000Z',
    });
  });

  it('traduce la prioridad media', () => {
    expect(
      toCreateAnnouncementDto({ title: 'a', description: 'b', priority: 'medium', expiresAt: null })
        .prioridad,
    ).toBe('MEDIA');
  });
});
