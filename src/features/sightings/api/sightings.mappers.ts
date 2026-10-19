import {
  type KingdomCode,
  occurrenceDtoSchema,
  occurrencePageDtoSchema,
} from '../schemas/sighting-dto.schema';
import { type Kingdom, type Sighting, type SightingInput, type SightingPage } from '../types';

const KINGDOM_FROM_API: Record<KingdomCode, Kingdom> = {
  ANIMALIA: 'animalia',
  PLANTAE: 'plantae',
  FUNGI: 'fungi',
  DESCONOCIDO: 'unknown',
};

const KINGDOM_TO_API: Record<Kingdom, KingdomCode> = {
  animalia: 'ANIMALIA',
  plantae: 'PLANTAE',
  fungi: 'FUNGI',
  unknown: 'DESCONOCIDO',
};

const STATUS_FROM_API = {
  PENDIENTE: 'pending',
  APROBADO: 'approved',
  RECHAZADO: 'rejected',
} as const;

/** Valor que la API guarda cuando no se indicó la clasificación específica. */
const UNKNOWN_VERNACULAR_NAME = 'desconocido';

/** Valida y traduce un `OccurrenceDto` a `Sighting`. Lanza si la respuesta no cumple el contrato. */
export function toSighting(dto: unknown): Sighting {
  const parsed = occurrenceDtoSchema.parse(dto);
  const vernacularName = parsed.vernacularName?.trim() ?? '';
  const latitude = parsed.decimalLatitude;
  const longitude = parsed.decimalLongitude;

  return {
    id: parsed.id,
    remarks: parsed.occurrenceRemarks,
    kingdom: KINGDOM_FROM_API[parsed.kingdom],
    vernacularName:
      vernacularName.length === 0 || vernacularName.toLowerCase() === UNKNOWN_VERNACULAR_NAME
        ? null
        : vernacularName,
    // La API guarda las dos coordenadas juntas o ninguna.
    location:
      typeof latitude === 'number' && typeof longitude === 'number'
        ? { latitude, longitude }
        : null,
    author: parsed.recordedBy,
    photoUrl: parsed.urlFoto || null,
    status: STATUS_FROM_API[parsed.estado],
    createdAt: parsed.fechaCreacion,
    reviewedAt: parsed.fechaRevision ?? null,
  };
}

/** Valida y traduce una `PageResponse<OccurrenceDto>`. */
export function toSightingPage(dto: unknown): SightingPage {
  const parsed = occurrencePageDtoSchema.parse(dto);
  return {
    items: parsed.contenido.map(toSighting),
    page: parsed.pagina,
    totalPages: parsed.totalPaginas,
  };
}

/**
 * Campos de texto de `OccurrenceRequest`. Los opcionales vacíos no se envían: la API los completa
 * con `DESCONOCIDO` / "Desconocido". Las coordenadas van juntas o no van.
 */
export function toSightingFields(input: SightingInput): Record<string, string> {
  const fields: Record<string, string> = {
    occurrenceRemarks: input.remarks.trim(),
    kingdom: KINGDOM_TO_API[input.kingdom],
  };
  const vernacularName = input.vernacularName.trim();
  if (vernacularName.length > 0) fields.vernacularName = vernacularName;
  if (input.location) {
    fields.decimalLatitude = String(input.location.latitude);
    fields.decimalLongitude = String(input.location.longitude);
  }
  return fields;
}

/** `multipart/form-data` solo de texto, para reportes sin foto. */
export function toSightingFormData(input: SightingInput): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(toSightingFields(input))) data.append(name, value);
  return data;
}
