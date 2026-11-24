import {
  type InitialViewState,
  type LngLat,
  type LngLatBounds,
} from '@maplibre/maplibre-react-native';

import { type Coordinates, type TrailMap } from '../types';

/** Tamaño mínimo del encuadre (en grados) para no acercar demasiado un recorrido muy corto. */
const MIN_BOUNDS_SPAN = 0.002;
/** Margen alrededor del recorrido al abrir el mapa, en puntos de pantalla. */
const BOUNDS_PADDING = 48;
/** Zoom al centrar en la ubicación del visitante (≈ 1 km de ancho en un teléfono). */
export const LOCATION_ZOOM = 15;

/** MapLibre trabaja con `[longitud, latitud]`; la app, con `{ latitude, longitude }`. */
export function toLngLat(coordinates: Coordinates): LngLat {
  return [coordinates.longitude, coordinates.latitude];
}

export function fromLngLat([longitude, latitude]: LngLat): Coordinates {
  return { latitude, longitude };
}

/** Encuadra todos los tramos y estaciones para que el recorrido quede visible al abrir el mapa. */
export function getInitialViewState(map: TrailMap): InitialViewState {
  const points = [
    ...map.segments.flatMap((segment) => segment.coordinates),
    ...map.stations.map((station) => station.coordinates),
  ];
  const bounds = map.bounds ?? getBounds(points);

  if (bounds === null) {
    throw new Error('No se puede encuadrar un mapa sin coordenadas.');
  }

  return {
    bounds: expandBounds(bounds),
    padding: {
      top: BOUNDS_PADDING,
      right: BOUNDS_PADDING,
      bottom: BOUNDS_PADDING,
      left: BOUNDS_PADDING,
    },
  };
}

/** Vista cercana centrada en un punto (ubicación del visitante o punto elegido). */
export function getLocationViewState(coordinates: Coordinates) {
  return { center: toLngLat(coordinates), zoom: LOCATION_ZOOM };
}

/** `[oeste, sur, este, norte]`, con un tamaño mínimo alrededor del centro. */
function expandBounds({ southWest, northEast }: NonNullable<TrailMap['bounds']>): LngLatBounds {
  const centerLatitude = (southWest.latitude + northEast.latitude) / 2;
  const centerLongitude = (southWest.longitude + northEast.longitude) / 2;
  const halfLatitude = Math.max(northEast.latitude - southWest.latitude, MIN_BOUNDS_SPAN) / 2;
  const halfLongitude = Math.max(northEast.longitude - southWest.longitude, MIN_BOUNDS_SPAN) / 2;

  return [
    centerLongitude - halfLongitude,
    centerLatitude - halfLatitude,
    centerLongitude + halfLongitude,
    centerLatitude + halfLatitude,
  ];
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
