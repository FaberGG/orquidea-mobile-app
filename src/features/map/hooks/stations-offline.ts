import { type QueryClient } from '@tanstack/react-query';

import { type OfflineSource } from '@/lib/offline';

import { listStations } from '../api';
import { stationKeys } from '../constants';

/**
 * HU-21: descarga las estaciones para consultarlas sin conexión y siembra el detalle de cada una
 * (`stationKeys.detail(id)`). Devuelve las URLs de las fotos de las estaciones y de las fichas asociadas.
 *
 * El recorrido del mapa (`/api/mapa`) se agrega como otra fuente en SCRUM-68.
 */
export async function prefetchStationsForOffline(queryClient: QueryClient): Promise<string[]> {
  const stations = await queryClient.fetchQuery({
    queryKey: stationKeys.list(),
    queryFn: listStations,
    staleTime: 0,
  });
  for (const station of stations) {
    queryClient.setQueryData(stationKeys.detail(station.id), station);
  }
  // Las estaciones eliminadas en el servidor dejan de estar disponibles sin conexión.
  const ids = new Set(stations.map((station) => station.id));
  queryClient.removeQueries({
    queryKey: [...stationKeys.all, 'detail'],
    predicate: (query) => !ids.has(String(query.queryKey[2])),
  });
  return stations.flatMap((station) => [
    ...(station.photoUrl ? [station.photoUrl] : []),
    ...station.species.flatMap((species) => (species.photoUrl ? [species.photoUrl] : [])),
  ]);
}

/** Fuente offline de las estaciones (la registra `features/offline`). */
export const stationsOfflineSource: OfflineSource = {
  name: 'stations',
  queryKey: stationKeys.all,
  prefetch: prefetchStationsForOffline,
};
