import { apiClient, uploadMultipart } from '@/lib/api';

import { SIGHTINGS_PAGE_SIZE } from '../constants';
import { type Sighting, type SightingInput, type SightingPage } from '../types';
import {
  toSighting,
  toSightingFields,
  toSightingFormData,
  toSightingPage,
} from './sightings.mappers';

const SIGHTINGS_PATH = '/api/reportes-avistamiento';

/**
 * HU-20: `GET /api/reportes-avistamiento`. Público (sin token); solo reportes aprobados, los más
 * recientes primero.
 */
export async function listApprovedSightings(page: number): Promise<SightingPage> {
  const response = await apiClient.get<unknown>(SIGHTINGS_PATH, {
    query: { pagina: page, tamano: SIGHTINGS_PAGE_SIZE },
    authenticated: false,
  });
  return toSightingPage(response);
}

/** HU-19: `GET /api/reportes-avistamiento/pendientes`. Admin+; los más antiguos primero. */
export async function listPendingSightings(page: number): Promise<SightingPage> {
  const response = await apiClient.get<unknown>(`${SIGHTINGS_PATH}/pendientes`, {
    query: { pagina: page, tamano: SIGHTINGS_PAGE_SIZE },
  });
  return toSightingPage(response);
}

/**
 * HU-18: `POST /api/reportes-avistamiento` (multipart). El autor lo pone el servidor a partir del
 * token (CA4). Con foto se usa la subida nativa; sin foto, `multipart` de texto.
 */
export async function createSighting(input: SightingInput): Promise<Sighting> {
  if (input.photo) {
    const response = await uploadMultipart(
      'POST',
      SIGHTINGS_PATH,
      toSightingFields(input),
      { uri: input.photo.uri, mimeType: input.photo.mimeType },
      'foto',
    );
    return toSighting(response);
  }
  const response = await apiClient.post<unknown>(SIGHTINGS_PATH, {
    formData: toSightingFormData(input),
  });
  return toSighting(response);
}

/** HU-19: aprueba (`/aprobar`) o rechaza (`/rechazar`) un reporte pendiente. `409` = ya revisado. */
export async function reviewSighting(
  id: string,
  decision: 'approve' | 'reject',
): Promise<Sighting> {
  const action = decision === 'approve' ? 'aprobar' : 'rechazar';
  const response = await apiClient.post<unknown>(
    `${SIGHTINGS_PATH}/${encodeURIComponent(id)}/${action}`,
  );
  return toSighting(response);
}
