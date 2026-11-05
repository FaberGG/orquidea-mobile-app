import { useQuery } from '@tanstack/react-query';

import { getTrailMap } from '../api/map.api';
import { mapKeys } from '../constants';

/** HU-12: lee el recorrido y mantiene la respuesta en caché mientras se usa el mapa. */
export function useTrailMap() {
  return useQuery({
    queryKey: mapKeys.detail(),
    queryFn: ({ signal }) => getTrailMap(signal),
    staleTime: 60_000,
  });
}
