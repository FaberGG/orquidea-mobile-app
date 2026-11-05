import { apiClient, uploadMultipart } from '@/lib/api';

import { type Station, type StationInput } from '../types';
import { toStation, toStationFields, toStationFormData, toStationList } from './stations.mappers';

// HU-13 (SCRUM-40). Contrato integrado en el backend compartido `dev`.
const STATIONS_PATH = '/api/estaciones';

const stationPath = (id: string) => `${STATIONS_PATH}/${encodeURIComponent(id)}`;

/** Con foto nueva usa la subida nativa (campo `foto`); sin foto, `multipart` solo de texto. */
async function sendStation(
  method: 'POST' | 'PUT',
  path: string,
  input: StationInput,
): Promise<unknown> {
  if (input.photo) {
    return uploadMultipart(
      method,
      path,
      toStationFields(input),
      { uri: input.photo.uri, mimeType: input.photo.mimeType },
      'foto',
    );
  }
  const formData = toStationFormData(input);
  return method === 'POST'
    ? apiClient.post<unknown>(path, { formData })
    : apiClient.put<unknown>(path, { formData });
}

/** HU-12/13: `GET /api/estaciones`. Público (sin token) y sin paginación. */
export async function listStations(): Promise<Station[]> {
  return toStationList(await apiClient.get<unknown>(STATIONS_PATH, { authenticated: false }));
}

/** `GET /api/estaciones/{id}`. Público. `404` = la estación no existe. */
export async function getStation(id: string): Promise<Station> {
  return toStation(await apiClient.get<unknown>(stationPath(id), { authenticated: false }));
}

/**
 * HU-13 CA1/CA4: `POST /api/estaciones` (`multipart/form-data`, foto obligatoria). `400` = coordenadas
 * inválidas, campos incompletos, formato de imagen o ficha inexistente; `413` = foto grande.
 */
export async function createStation(input: StationInput): Promise<Station> {
  return toStation(await sendStation('POST', STATIONS_PATH, input));
}

/** HU-13 CA2: `PUT /api/estaciones/{id}`. Sin foto nueva se conserva la actual; las fichas se reemplazan. */
export async function updateStation(id: string, input: StationInput): Promise<Station> {
  return toStation(await sendStation('PUT', stationPath(id), input));
}

/** HU-13 CA5: `DELETE /api/estaciones/{id}` → `204`. */
export async function deleteStation(id: string): Promise<void> {
  await apiClient.delete<unknown>(stationPath(id));
}
