import { CONTENT_MESSAGES } from '../constants';
import { announcementFormSchema } from './announcement-form.schema';

function firstError(values: { title: string; description: string }) {
  const result = announcementFormSchema.safeParse(values);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('announcementFormSchema (HU-16)', () => {
  it('acepta título y contenido', () => {
    expect(firstError({ title: 'Jornada de aves', description: 'Sábado 8 a. m.' })).toBeUndefined();
  });

  it.each([
    ['sin título', { title: '', description: 'Contenido' }],
    ['sin contenido', { title: 'Título', description: '' }],
    ['sin ambos', { title: '', description: '' }],
    ['solo espacios', { title: '   ', description: '  ' }],
  ])('CA2: %s muestra "Debes completar el título y el contenido del anuncio."', (_c, values) => {
    expect(firstError(values)).toBe(CONTENT_MESSAGES.announcementRequiredFields);
  });

  it('quita los espacios de los extremos', () => {
    expect(announcementFormSchema.parse({ title: '  Hola ', description: ' Texto ' })).toEqual({
      title: 'Hola',
      description: 'Texto',
    });
  });
});
