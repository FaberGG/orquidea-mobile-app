import { formatDate } from './format-date';

describe('formatDate', () => {
  it('muestra día, mes y año', () => {
    expect(formatDate('2026-10-09T15:30:00.123456Z')).toMatch(/^\d{2}\/10\/2026$/);
  });

  it('devuelve null si la fecha no es válida', () => {
    expect(formatDate('ayer')).toBeNull();
  });
});
