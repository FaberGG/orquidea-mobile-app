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

/** Valor inicial del selector de finalización: mañana a la misma hora, en minutos exactos. */
export function getDefaultExpiration(now: Date = new Date()): Date {
  const date = new Date(now);
  date.setDate(date.getDate() + 1);
  date.setSeconds(0, 0);
  return date;
}
