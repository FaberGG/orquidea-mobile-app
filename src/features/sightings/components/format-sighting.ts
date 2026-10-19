import { type Coordinates } from '../types';

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Fecha ISO → `dd/mm/aaaa · hh:mm` en la hora local del teléfono (Figma: "24/03/2026 · 12:30").
 * Devuelve `null` si la fecha no es válida.
 */
export function formatSightingDate(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const day = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  return `${day} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Iniciales del autor para el avatar (la API no expone foto de perfil). Máximo dos letras. */
export function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  return initials.length > 0 ? initials : '?';
}

/** Coordenadas legibles con 5 decimales (~1 m), p. ej. `2.45980, -76.61150`. */
export function formatCoordinates({ latitude, longitude }: Coordinates): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

/** Enlace que abre el punto en la app de mapas (o en el navegador). */
export function getMapsUrl({ latitude, longitude }: Coordinates): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/** Proporción con la que se muestra una foto en el foro, acotada a `[min, max]`. */
export function clampAspectRatio(width: number, height: number, min: number, max: number): number {
  if (width <= 0 || height <= 0) return 1;
  return Math.min(max, Math.max(min, width / height));
}
