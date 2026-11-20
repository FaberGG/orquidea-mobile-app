import { type Coordinates } from '../types';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/** Construye un GPX 1.1 para compartir el trazado dibujado en el mapa. */
export function buildTrailGpx(name: string, coordinates: Coordinates[]): string {
  if (coordinates.length < 2) {
    throw new Error('El sendero necesita al menos dos puntos.');
  }

  const points = coordinates
    .map(
      ({ latitude, longitude }) =>
        `      <trkpt lat="${latitude.toFixed(6)}" lon="${longitude.toFixed(6)}" />`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Terravia" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(name.trim())}</name>
    <desc>Recorrido trazado desde la app Terravia.</desc>
  </metadata>
  <trk>
    <name>${escapeXml(name.trim())}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>
`;
}

export function trailGpxFileName(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `${slug || 'sendero'}.gpx`;
}
