import { sightingFormSchema, type SightingFormValues } from './sighting-form.schema';

const VALID: SightingFormValues = {
  photo: null,
  kingdom: null,
  vernacularName: '',
  isVernacularNameUnknown: false,
  remarks: 'Vi un azulejo en el borde del humedal',
  location: null,
};

describe('sightingFormSchema (HU-18)', () => {
  it('acepta un reporte con solo la descripción', () => {
    expect(sightingFormSchema.safeParse(VALID).success).toBe(true);
  });

  it('muestra "La descripción es obligatoria." si la descripción está vacía (CA2)', () => {
    const result = sightingFormSchema.safeParse({ ...VALID, remarks: '   ' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('La descripción es obligatoria.');
  });

  it('rechaza una descripción de más de 2000 caracteres', () => {
    const result = sightingFormSchema.safeParse({ ...VALID, remarks: 'a'.repeat(2001) });
    expect(result.error?.issues[0].message).toBe(
      'La descripción no puede superar 2000 caracteres.',
    );
  });

  it('rechaza coordenadas fuera de rango', () => {
    const result = sightingFormSchema.safeParse({
      ...VALID,
      location: { latitude: 91, longitude: 0 },
    });
    expect(result.success).toBe(false);
  });
});
