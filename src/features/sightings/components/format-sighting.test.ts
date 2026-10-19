import { clampAspectRatio, formatCoordinates, getInitials } from './format-sighting';

describe('getInitials', () => {
  it('toma la inicial del nombre y del apellido', () => {
    expect(getInitials('ana gómez')).toBe('AG');
    expect(getInitials('María Fernanda López')).toBe('MF');
  });

  it('devuelve "?" sin nombre', () => {
    expect(getInitials('   ')).toBe('?');
  });
});

describe('formatCoordinates', () => {
  it('muestra cinco decimales', () => {
    expect(formatCoordinates({ latitude: 2.4598, longitude: -76.6115 })).toBe('2.45980, -76.61150');
  });
});

describe('clampAspectRatio', () => {
  const MIN = 4 / 5;
  const MAX = 1.91;

  it('respeta las proporciones intermedias (1:1 y 16:9)', () => {
    expect(clampAspectRatio(1000, 1000, MIN, MAX)).toBe(1);
    expect(clampAspectRatio(1920, 1080, MIN, MAX)).toBeCloseTo(16 / 9);
  });

  it('recorta las fotos más altas que 4:5 (3:4, 9:16) y las muy anchas a 1.91:1', () => {
    expect(clampAspectRatio(750, 1000, MIN, MAX)).toBe(MIN);
    expect(clampAspectRatio(1080, 2400, MIN, MAX)).toBe(MIN);
    expect(clampAspectRatio(3000, 1000, MIN, MAX)).toBe(MAX);
  });
});
