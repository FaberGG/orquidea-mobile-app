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

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Fecha corta `31 dic 2026` en hora de Colombia (UTC-5, sin horario de verano). */
export function formatShortDate(iso: string): string {
  const date = new Date(new Date(iso).getTime() + BOGOTA_OFFSET_MS);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Tiempo transcurrido desde `iso`: `hace un momento`, `hace 5 min`, `hace 3 h`, `hace 40 días`… */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 60) return days === 1 ? 'hace 1 día' : `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
  const years = Math.floor(days / 365);
  return years <= 1 ? 'hace 1 año' : `hace ${years} años`;
}

/**
 * Vigencia de un anuncio: `Expirado el 30 sep 2026`, `Vence hoy`, `Vence en 4 días` (hasta una semana)
 * o `Vence el 31 dic 2026`.
 */
export function formatExpiration(iso: string, now: Date = new Date()): string {
  const remaining = new Date(iso).getTime() - now.getTime();
  if (remaining <= 0) return `Expirado el ${formatShortDate(iso)}`;
  const days = Math.ceil(remaining / DAY_MS);
  if (days <= 1) return 'Vence hoy';
  if (days <= 7) return `Vence en ${days} días`;
  return `Vence el ${formatShortDate(iso)}`;
}
