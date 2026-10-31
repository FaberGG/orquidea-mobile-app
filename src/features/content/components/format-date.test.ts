import { formatDate, formatDateTime, getDefaultExpiration } from './format-date';

describe('formatDate', () => {
  it('muestra día, mes y año', () => {
    expect(formatDate('2026-10-09T15:30:00.123456Z')).toMatch(/^\d{2}\/10\/2026$/);
  });

  it('devuelve null si la fecha no es válida', () => {
    expect(formatDate('ayer')).toBeNull();
  });
});

describe('formatDateTime y getDefaultExpiration', () => {
  it('muestra fecha y hora en 24 h', () => {
    expect(formatDateTime(new Date(2026, 10, 5, 18, 7))).toBe('05/11/2026 18:07');
  });

  it('propone mañana a la misma hora, sin segundos', () => {
    expect(getDefaultExpiration(new Date(2026, 9, 30, 12, 30, 45))).toEqual(
      new Date(2026, 9, 31, 12, 30, 0, 0),
    );
  });
});
