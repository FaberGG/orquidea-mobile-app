import { stationDtoSchema, stationListDtoSchema } from '../schemas/station-dto.schema';
import { type Station, type StationInput } from '../types';

/** Valida y traduce un `EstacionDto` a `Station`. Lanza si la respuesta no cumple el contrato. */
export function toStation(dto: unknown): Station {
  const parsed = stationDtoSchema.parse(dto);
  return {
    id: parsed.id,
    name: parsed.nombre,
    description: parsed.descripcion ?? '',
    photoUrl: parsed.urlFoto || null,
    location: { latitude: parsed.decimalLatitude, longitude: parsed.decimalLongitude },
    species: (parsed.fichas ?? []).map((species) => ({
      id: species.id,
      vernacularName: species.vernacularName,
      photoUrl: species.urlFoto || null,
    })),
  };
}

/** Valida y traduce la lista de `GET /api/estaciones`. */
export function toStationList(dto: unknown): Station[] {
  return stationListDtoSchema.parse(dto).map(toStation);
}

/**
 * Campos de texto del multipart de crear y editar. `fichaIds` va como **un solo campo separado por comas**
 * (`id1,id2`): la subida nativa (`uploadMultipart`) no permite repetir un campo, y Spring convierte esa
 * cadena en `List<UUID>`. Sin fichas, el campo no se envía (al editar, eso deja la estación sin fichas).
 */
export function toStationFields(input: StationInput): Record<string, string> {
  const fields: Record<string, string> = {
    nombre: input.name.trim(),
    descripcion: input.description.trim(),
    decimalLatitude: String(input.location.latitude),
    decimalLongitude: String(input.location.longitude),
  };
  if (input.speciesIds.length > 0) fields.fichaIds = input.speciesIds.join(',');
  return fields;
}

/** `multipart/form-data` solo de texto, para editar sin cambiar la foto. */
export function toStationFormData(input: StationInput): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(toStationFields(input))) data.append(name, value);
  return data;
}
