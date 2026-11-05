import { z } from 'zod';

const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const geoJsonLineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z
    .array(z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]))
    .min(2),
});

const mapSegmentDtoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  orden: z.number().int(),
  geometria: geoJsonLineStringSchema,
});

const stationTaxonDtoSchema = z.object({
  id: z.string().uuid(),
  vernacularName: z.string(),
  urlFoto: z.string().url().nullable(),
});

const stationDtoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  urlFoto: z.string().url().nullable(),
  decimalLatitude: z.number().min(-90).max(90),
  decimalLongitude: z.number().min(-180).max(180),
  fichas: z.array(stationTaxonDtoSchema),
});

const mapBoundsSchema = z
  .tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ])
  .refine(
    ([minLongitude, minLatitude, maxLongitude, maxLatitude]) =>
      minLongitude <= maxLongitude && minLatitude <= maxLatitude,
  );

export const trailMapDtoSchema = z.object({
  version: z.string(),
  limites: mapBoundsSchema.nullable(),
  tramos: z.array(mapSegmentDtoSchema),
  estaciones: z.array(stationDtoSchema),
});

export { coordinateSchema };
