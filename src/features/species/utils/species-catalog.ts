import { type CategoryFilter } from '../constants';
import { type Species, type SpeciesCatalog, type SpeciesSync } from '../types';

// Orden de la API: nombre común sin distinguir mayúsculas ni tildes, con la "ñ" después de la "n".
const collator = new Intl.Collator('es', { sensitivity: 'base' });

/** Ordena las fichas por nombre común como la API. No modifica la lista recibida. */
export function sortSpecies(species: readonly Species[]): Species[] {
  return [...species].sort(
    (a, b) => collator.compare(a.vernacularName, b.vernacularName) || a.id.localeCompare(b.id),
  );
}

/**
 * Aplica una sincronización a la copia local (HU-21). Completa: reemplaza todo. Por cambios: guarda cada ficha
 * por `id` (reemplaza las repetidas) y quita las de `deletedIds` (ignora las que no estaban).
 */
export function applySpeciesSync(
  current: SpeciesCatalog | undefined,
  sync: SpeciesSync,
): SpeciesCatalog {
  const byId = new Map<string, Species>();
  if (!sync.complete) {
    for (const item of current?.species ?? []) byId.set(item.id, item);
    for (const id of sync.deletedIds) byId.delete(id);
  }
  for (const item of sync.species) byId.set(item.id, item);
  return { syncedAt: sync.syncedAt, species: sortSpecies([...byId.values()]) };
}

/** Fichas de una categoría, en el orden de la copia. `all` no filtra. */
export function filterSpeciesByCategory(
  species: readonly Species[],
  category: CategoryFilter,
): Species[] {
  return category === 'all' ? [...species] : species.filter((item) => item.category === category);
}

/**
 * URLs que se descargan para usar las fichas sin conexión: la miniatura del listado y todas las fotos del
 * detalle. Siempre de la copia completa, para que la limpieza de archivos no borre fotos vigentes.
 */
export function speciesOfflinePhotoUrls(species: readonly Species[]): string[] {
  return species.flatMap((item) => [
    ...(item.thumbnailUrl ? [item.thumbnailUrl] : []),
    ...item.photos.map((photo) => photo.url),
  ]);
}
