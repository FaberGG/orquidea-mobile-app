import { STATION_MESSAGES } from '../constants';
import { parseCoordinate, stationFormSchema } from './station-form.schema';

const VALID = {
  name: 'Mirador',
  description: 'Se observan garzas.',
  latitude: '2.4598',
  longitude: '-76.6115',
  photo: null,
  speciesIds: [],
};

const firstMessage = (values: object) => {
  const result = stationFormSchema.safeParse({ ...VALID, ...values });
  return result.success ? undefined : result.error.issues[0].message;
};

describe('stationFormSchema (HU-13)', () => {
  it('acepta una estación válida', () => {
    expect(stationFormSchema.safeParse(VALID).success).toBe(true);
  });

  it.each(['name', 'description', 'latitude', 'longitude'])('exige %s', (field) => {
    expect(firstMessage({ [field]: '  ' })).toBe(STATION_MESSAGES.requiredFields);
  });

  it.each([
    ['latitud > 90', { latitude: '90.5' }],
    ['latitud < -90', { latitude: '-91' }],
    ['longitud > 180', { longitude: '181' }],
    ['texto no numérico', { latitude: 'norte' }],
  ])('rechaza coordenadas inválidas: %s (CA3)', (_, values) => {
    expect(firstMessage(values)).toBe(STATION_MESSAGES.invalidCoordinates);
  });

  it('acepta los límites y la coma decimal', () => {
    expect(firstMessage({ latitude: '-90', longitude: '180' })).toBeUndefined();
    expect(parseCoordinate(' 2,4598 ')).toBe(2.4598);
  });

  it('limita el nombre a 150 caracteres', () => {
    expect(firstMessage({ name: 'a'.repeat(151) })).toBe(STATION_MESSAGES.nameTooLong);
  });
});
