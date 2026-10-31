import { CONTENT_MESSAGES } from '../constants';
import { announcementFormSchema, type AnnouncementFormValues } from './announcement-form.schema';

const VALID: AnnouncementFormValues = {
  title: 'Jornada de aves',
  description: 'Sábado 8 a. m.',
  priority: 'medium',
  expiresAt: null,
};

function firstError(values: Partial<AnnouncementFormValues>) {
  const result = announcementFormSchema.safeParse({ ...VALID, ...values });
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('announcementFormSchema (HU-16 y HU-23)', () => {
  it('acepta título, contenido y prioridad, sin fecha de finalización (HU-23 CA2)', () => {
    expect(firstError({})).toBeUndefined();
  });

  it.each([
    ['sin título', { title: '' }],
    ['sin contenido', { description: '' }],
    ['sin ambos', { title: '', description: '' }],
    ['solo espacios', { title: '   ', description: '  ' }],
  ])('CA2: %s muestra "Debes completar el título y el contenido del anuncio."', (_c, values) => {
    expect(firstError(values)).toBe(CONTENT_MESSAGES.announcementRequiredFields);
  });

  it('CA3: exige la prioridad', () => {
    expect(firstError({ priority: null })).toBe(CONTENT_MESSAGES.announcementPriorityRequired);
  });

  it('HU-23 CA1: acepta una fecha de finalización futura', () => {
    expect(firstError({ expiresAt: new Date(Date.now() + 60 * 60 * 1000) })).toBeUndefined();
  });

  it.each([
    ['pasada', -60 * 60 * 1000],
    ['igual a la actual', 0],
  ])('HU-23 CA3: rechaza una fecha %s', (_c, offset) => {
    jest.useFakeTimers({ now: new Date('2026-10-30T12:00:00Z') });
    expect(firstError({ expiresAt: new Date(Date.now() + offset) })).toBe(
      CONTENT_MESSAGES.announcementExpirationInvalid,
    );
    jest.useRealTimers();
  });

  it('quita los espacios de los extremos', () => {
    expect(
      announcementFormSchema.parse({ ...VALID, title: '  Hola ', description: ' Texto ' }),
    ).toEqual({ ...VALID, title: 'Hola', description: 'Texto' });
  });
});
