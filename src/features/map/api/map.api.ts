import { apiClient } from '@/lib/api';

import { type TrailMap } from '../types';
import { toTrailMap } from './map.mappers';

/** HU-12: consulta el recorrido y las estaciones públicas que devuelve el backend. */
export async function getTrailMap(signal?: AbortSignal): Promise<TrailMap> {
  const response = await apiClient.get<unknown>('/api/mapa', {
    authenticated: false,
    signal,
  });
  return toTrailMap(response);
}
