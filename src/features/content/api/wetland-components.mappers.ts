import { wetlandComponentDtoSchema, wetlandComponentListDtoSchema } from '../schemas';
import {
  type UpdateWetlandComponentRequestDto,
  type WetlandComponent,
  type WetlandComponentChanges,
} from '../types';

/** Valida y traduce un componente de la API. Lanza si la respuesta no cumple el contrato. */
export function toWetlandComponent(dto: unknown): WetlandComponent {
  const parsed = wetlandComponentDtoSchema.parse(dto);
  return {
    type: parsed.tipo,
    name: parsed.nombre,
    description: parsed.descripcion ?? '',
    hasContent: parsed.tieneContenido,
    photos: (parsed.fotos ?? []).map(({ id, url }) => ({ id, url })),
    updatedAt: parsed.fechaActualizacion || null,
  };
}

/** Valida y traduce la lista de `GET /api/componentes`. */
export function toWetlandComponentList(dto: unknown): WetlandComponent[] {
  return wetlandComponentListDtoSchema.parse(dto).map(toWetlandComponent);
}

/** Cuerpo de `PUT /api/componentes/{tipo}`, ya sin espacios sobrantes. */
export function toUpdateWetlandComponentDto({
  name,
  description,
}: Pick<WetlandComponentChanges, 'name' | 'description'>): UpdateWetlandComponentRequestDto {
  return { nombre: name.trim(), descripcion: description.trim() };
}
