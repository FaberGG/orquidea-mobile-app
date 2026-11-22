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
  /** Foto principal (la primera de `photos`). */
  photoUrl: string | null;
  /**
   * Miniatura de la foto principal, para el listado (HU-10). Si la API no la envía es la propia foto. Puede
   * faltar en copias offline guardadas antes de las miniaturas: usar `thumbnailUrl ?? photoUrl`.
   */
  thumbnailUrl: string | null;
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

/** Respuesta de `GET /api/fichas-taxonomicas/sincronizacion` (HU-21), ya traducida. */
export type SpeciesSync = {
  /** Cursor del servidor; se envía tal cual como `modificadoDesde` en la próxima sincronización. */
  syncedAt: string;
  /** `true`: `species` trae todas las fichas y la copia local se reemplaza entera. */
  complete: boolean;
  /** Fichas creadas o modificadas (todas si `complete`). Puede repetir fichas ya recibidas. */
  species: Species[];
  /** Fichas eliminadas desde el cursor anterior. */
  deletedIds: string[];
};

/**
 * Copia local de todas las fichas (HU-21). El cursor y las fichas se guardan juntos en una sola entrada: si la
 * copia se pierde, también se pierde el cursor y la siguiente sincronización vuelve a ser completa.
 */
export type SpeciesCatalog = {
  /** `null` si la copia no salió de una sincronización (p. ej. migrada del formato anterior). */
  syncedAt: string | null;
  /** Ordenadas por nombre común como la API (sin distinguir mayúsculas ni tildes). */
  species: Species[];
};
