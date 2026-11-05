import { toAdminAnnouncementList, toAnnouncementList } from './announcements.mappers';

const BASE = {
  id: '668e1c89-f3c0-41c3-b542-ab0be154e02d',
  titulo: 'Día Mundial de los Insectos',
  descripcion: 'Jornada de polinizadores en el humedal',
  fechaCreacion: '2026-10-30T20:39:05.796667Z',
  prioridad: 'ALTA',
  estado: 'ACTIVO',
  expirado: false,
  fechaExpiracion: null,
};

describe('toAnnouncementList (HU-17)', () => {
  it('conserva la fecha de finalización y el nombre del publicador cuando existen', () => {
    const [withExpiration, withoutExpiration] = toAnnouncementList([
      { ...BASE, fechaExpiracion: '2026-11-12T23:00:00Z', nombrePublicador: ' Ana Gómez ' },
      { ...BASE, fechaExpiracion: null },
    ]);

    expect(withExpiration.expiresAt).toBe('2026-11-12T23:00:00Z');
    expect(withExpiration.publisherName).toBe('Ana Gómez');
    expect(withoutExpiration.expiresAt).toBeNull();
    expect(withoutExpiration.publisherName).toBeNull();
  });
});

describe('toAdminAnnouncementList (HU-24)', () => {
  it('traduce un anuncio visible', () => {
    expect(toAdminAnnouncementList([BASE])).toEqual([
      {
        id: BASE.id,
        title: BASE.titulo,
        description: BASE.descripcion,
        publishedAt: BASE.fechaCreacion,
        priority: 'high',
        expiresAt: null,
        visibility: 'visible',
      },
    ]);
  });

  it.each([
    ['INACTIVO y vigente → oculto', { estado: 'INACTIVO', expirado: false }, 'hidden'],
    ['ACTIVO y vencido → expirado', { estado: 'ACTIVO', expirado: true }, 'expired'],
    ['INACTIVO y vencido → expirado', { estado: 'INACTIVO', expirado: true }, 'expired'],
  ])('%s', (_c, change, expected) => {
    const [announcement] = toAdminAnnouncementList([
      { ...BASE, ...change, fechaExpiracion: '2026-10-30T20:43:00Z' },
    ]);
    expect(announcement.visibility).toBe(expected);
    expect(announcement.expiresAt).toBe('2026-10-30T20:43:00Z');
  });

  it('traduce las prioridades media y baja', () => {
    const result = toAdminAnnouncementList([
      { ...BASE, prioridad: 'MEDIA' },
      { ...BASE, prioridad: 'BAJA' },
    ]);
    expect(result.map((item) => item.priority)).toEqual(['medium', 'low']);
  });

  it('rechaza una respuesta que no cumple el contrato', () => {
    expect(() => toAdminAnnouncementList([{ ...BASE, estado: 'OCULTO' }])).toThrow();
  });
});
