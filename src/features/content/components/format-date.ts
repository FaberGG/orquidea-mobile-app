/** Fecha ISO → `dd/mm/aaaa` en la hora local del teléfono. Devuelve `null` si no es válida. */
export function formatDate(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

/** Fecha → `dd/mm/aaaa hh:mm` (24 h) en la hora local del teléfono. */
export function formatDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
}

/**
 * Valor inicial del selector de finalización: hoy, una hora más tarde, en minutos exactos. Si eso ya
 * cae en el día siguiente (cerca de la medianoche), se queda en hoy a las 23:59 para no cambiar de día.
 */
export function getDefaultExpiration(now: Date = new Date()): Date {
  const date = new Date(now);
  date.setHours(date.getHours() + 1, date.getMinutes(), 0, 0);
  if (date.getDate() !== now.getDate()) {
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 0, 0);
    return endOfToday;
  }
  return date;
}
