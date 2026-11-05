import { type Region } from 'react-native-maps';

import { type Coordinates, type TrailMap } from '../types';

const MIN_REGION_DELTA = 0.002;
const LOCATION_REGION_DELTA = 0.01;

/** Encuadra todos los tramos y estaciones para que el recorrido quede visible al abrir el mapa. */
export function getInitialMapRegion(map: TrailMap): Region {
  const points = [
    ...map.segments.flatMap((segment) => segment.coordinates),
    ...map.stations.map((station) => station.coordinates),
  ];
  const bounds = map.bounds ?? getBounds(points);

  if (bounds === null) {
    throw new Error('No se puede encuadrar un mapa sin coordenadas.');
  }

  const latitudeSpan = bounds.northEast.latitude - bounds.southWest.latitude;
  const longitudeSpan = bounds.northEast.longitude - bounds.southWest.longitude;

  return {
    latitude: (bounds.southWest.latitude + bounds.northEast.latitude) / 2,
    longitude: (bounds.southWest.longitude + bounds.northEast.longitude) / 2,
    latitudeDelta: Math.max(latitudeSpan * 1.4, MIN_REGION_DELTA),
    longitudeDelta: Math.max(longitudeSpan * 1.4, MIN_REGION_DELTA),
  };
}

/** Crea una vista cercana para centrar el mapa en la posición actual del visitante. */
export function getLocationMapRegion(coordinates: Coordinates): Region {
  return {
    ...coordinates,
    latitudeDelta: LOCATION_REGION_DELTA,
    longitudeDelta: LOCATION_REGION_DELTA,
  };
}

function getBounds(points: Coordinates[]): TrailMap['bounds'] {
  if (points.length === 0) return null;

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  return {
    southWest: { latitude: Math.min(...latitudes), longitude: Math.min(...longitudes) },
    northEast: { latitude: Math.max(...latitudes), longitude: Math.max(...longitudes) },
  };
}
