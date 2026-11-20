import {
  formatDate,
  formatDateTime,
  formatExpiration,
  formatRelativeTime,
  formatShortDate,
  getDefaultExpiration,
} from './format-date';

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

  it('propone hoy, una hora más tarde, sin segundos', () => {
    expect(getDefaultExpiration(new Date(2026, 9, 30, 12, 30, 45))).toEqual(
      new Date(2026, 9, 30, 13, 30, 0, 0),
    );
  });

  it('cerca de la medianoche no pasa al día siguiente', () => {
    expect(getDefaultExpiration(new Date(2026, 9, 30, 23, 20, 0))).toEqual(
      new Date(2026, 9, 30, 23, 59, 0, 0),
    );
  });
});

const NOW = new Date('2026-11-14T12:00:00Z');

describe('formatShortDate', () => {
  it('usa la fecha de Colombia (UTC-5)', () => {
    expect(formatShortDate('2026-12-31T23:00:00Z')).toBe('31 dic 2026');
    // 02:00 UTC del 1 de enero todavía es 31 de diciembre en Colombia.
    expect(formatShortDate('2027-01-01T02:00:00Z')).toBe('31 dic 2026');
  });
});

describe('formatRelativeTime', () => {
  it.each([
    ['2026-11-14T11:59:40Z', 'hace un momento'],
    ['2026-11-14T11:15:00Z', 'hace 45 min'],
    ['2026-11-14T09:00:00Z', 'hace 3 h'],
    ['2026-11-13T09:00:00Z', 'hace 1 día'],
    ['2026-10-05T12:00:00Z', 'hace 40 días'],
    ['2026-05-01T12:00:00Z', 'hace 6 meses'],
    ['2024-11-01T12:00:00Z', 'hace 2 años'],
  ])('%s → %s', (iso, expected) => {
    expect(formatRelativeTime(iso, NOW)).toBe(expected);
  });
});

describe('formatExpiration', () => {
  it.each([
    ['2026-09-30T15:00:00Z', 'Expirado el 30 sep 2026'],
    ['2026-11-14T20:00:00Z', 'Vence hoy'],
    ['2026-11-18T12:00:00Z', 'Vence en 4 días'],
    ['2026-12-31T23:00:00Z', 'Vence el 31 dic 2026'],
  ])('%s → %s', (iso, expected) => {
    expect(formatExpiration(iso, NOW)).toBe(expected);
  });
});
