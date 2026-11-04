import { type Coordinates } from '@/lib/location';

/** Coordenadas con seis decimales (~10 cm), como las guarda la API. */
export function formatCoordinates({ latitude, longitude }: Coordinates): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

/** Enlace universal de Google Maps: abre la app de mapas instalada o el navegador. */
export function getMapsUrl({ latitude, longitude }: Coordinates): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
