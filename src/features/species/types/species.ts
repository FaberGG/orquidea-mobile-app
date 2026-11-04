import { type CONSERVATION_CODES } from '../constants';
import { type SpeciesPhoto } from '../schemas/species-form.schema';

/**
 * Categorías de la API (v2.0, SCRUM-49): `AVE`, `PLANTA`, `INSECTO`, `MAMIFERO`, `REPTIL`, `ANFIBIO` y
 * `HONGO`; ver docs/api §3.
 */
export type SpeciesCategory =
  'bird' | 'plant' | 'insect' | 'mammal' | 'reptile' | 'amphibian' | 'fungus';

/** Códigos UICN que acepta la API. Todos están modelados; ver `CONSERVATION_STATUSES`. */
export type ConservationStatus = (typeof CONSERVATION_CODES)[number];

/**
 * Foto guardada de una ficha. `id` es `null` cuando la API todavía no envía `fotos` (solo `urlFoto`): esa
 * foto no se puede quitar por separado.
 */
export type SpeciesPhotoItem = {
  id: string | null;
  url: string;
};

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
  /** Foto principal (la primera de `photos`); la usa el listado (HU-10). */
  photoUrl: string | null;
  /** Todas las fotos en orden (HU-7 v2.0). */
  photos: SpeciesPhotoItem[];
};

/** Datos que se envían a la API para crear o editar una ficha (`TaxonRequest`, multipart). */
export type SpeciesInput = {
  category: SpeciesCategory;
  vernacularName: string;
  scientificName: string;
  order: string;
  family: string;
  genus: string;
  diet: string;
  wetlandRole: string;
  conservationStatus: ConservationStatus;
  /** Fotos nuevas, en orden. Al crear hay al menos una y la primera es la principal. */
  newPhotos: SpeciesPhoto[];
  /** Al editar: ids de las fotos guardadas que se quitan. */
  removedPhotoIds: string[];
};
