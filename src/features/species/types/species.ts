import { type CONSERVATION_CODES } from '../constants';

/** Categorías que la API publica hoy (`AVE`, `PLANTA`, `INSECTO`); ver docs/api §3. */
export type SpeciesCategory = 'bird' | 'plant' | 'insect';

/** Códigos UICN que acepta la API. Todos están modelados; ver `CONSERVATION_STATUSES`. */
export type ConservationStatus = (typeof CONSERVATION_CODES)[number];

/** Ficha taxonómica tal como la usa la app (campos en inglés Darwin Core, el resto traducido). */
export type Species = {
  id: string;
  category: SpeciesCategory;
  order: string | null;
  family: string | null;
  genus: string | null;
  scientificName: string;
  vernacularName: string;
  diet: string | null;
  /** Texto libre: la API aún no clasifica el rol en el humedal (se muestra solo como texto). */
  wetlandRole: string | null;
  conservationStatus: ConservationStatus;
  photoUrl: string | null;
};
