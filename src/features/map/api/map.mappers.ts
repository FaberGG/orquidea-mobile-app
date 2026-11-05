import { trailMapDtoSchema } from '../schemas';
import { type Coordinates, type TrailMap } from '../types';

/** Valida y convierte el DTO del mapa al modelo interno de la app. */
export function toTrailMap(response: unknown): TrailMap {
  const dto = trailMapDtoSchema.parse(response);

  return {
    version: dto.version,
    bounds:
      dto.limites === null
        ? null
        : {
            southWest: { latitude: dto.limites[1], longitude: dto.limites[0] },
            northEast: { latitude: dto.limites[3], longitude: dto.limites[2] },
          },
    segments: dto.tramos.map((segment) => ({
      id: segment.id,
      name: segment.nombre,
      order: segment.orden,
      coordinates: segment.geometria.coordinates.map(([longitude, latitude]) => ({
        latitude,
        longitude,
      })),
    })),
    stations: dto.estaciones.map((station) => ({
      id: station.id,
      name: station.nombre,
      description: station.descripcion,
      photoUrl: station.urlFoto,
      coordinates: {
        latitude: station.decimalLatitude,
        longitude: station.decimalLongitude,
      },
      species: station.fichas.map((taxon) => ({
        id: taxon.id,
        commonName: taxon.vernacularName,
        photoUrl: taxon.urlFoto,
      })),
    })),
  };
}

/** Calcula la distancia esférica entre dos coordenadas en metros. */
export function getDistanceInMeters(from: Coordinates, to: Coordinates): number {
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const startLatitude = toRadians(from.latitude);
  const endLatitude = toRadians(to.latitude);
  const haversine = Math.min(
    1,
    Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2,
  );

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Devuelve la estación más cercana y su distancia. En ausencia de estaciones devuelve null. */
export function getNearestStation(
  stations: TrailMap['stations'],
  coordinates: Coordinates,
): { station: TrailMap['stations'][number]; distanceMeters: number } | null {
  let nearest: { station: TrailMap['stations'][number]; distanceMeters: number } | null = null;

  for (const station of stations) {
    const distanceMeters = getDistanceInMeters(coordinates, station.coordinates);
    if (nearest === null || distanceMeters < nearest.distanceMeters) {
      nearest = { station, distanceMeters };
    }
  }

  return nearest;
}
