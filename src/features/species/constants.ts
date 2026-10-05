import { type IconName } from '@/components/ui/icon';

import { type ConservationStatus, type SpeciesCategory } from './types';

/** Textos de la interfaz de HE-03 (fichas taxonómicas). */
export const SPECIES_LABELS = {
  listTitle: 'Fichas taxonómicas',
  noSpeciesInCategory: 'Aún no hay especies registradas en esta categoría.',
  noSpeciesAtAll: 'Aún no hay especies registradas.',
  notFound: 'Esta ficha no existe o ya no está disponible.',
  loadError: 'No pudimos cargar las fichas. Revisa tu conexión e inténtalo de nuevo.',
  retry: 'REINTENTAR',
  sectionTaxonomy: 'Taxonomía',
  sectionDiet: 'Alimentación',
  sectionWetlandRole: 'Rol en el humedal',
  rowOrder: 'Orden',
  rowFamily: 'Familia',
  rowGenus: 'Género',
  rowSpecies: 'Especie',
  conservationLabel: 'Estado de conservación',
  editButton: 'Editar ficha',
  deleteButton: 'Eliminar ficha',
  back: 'Volver',
  noData: 'Sin información',
} as const;

/** Chips de categoría. `apiValue` es el valor de `categoria` en la API; `Todos` no filtra. */
export const SPECIES_CATEGORY_FILTERS = [
  { id: 'all', label: 'Todos', icon: 'categoryAll' },
  { id: 'bird', apiValue: 'AVE', label: 'Aves', icon: 'bird' },
  { id: 'plant', apiValue: 'PLANTA', label: 'Plantas', icon: 'plant' },
  { id: 'insect', apiValue: 'INSECTO', label: 'Insectos', icon: 'insect' },
] as const satisfies readonly {
  id: 'all' | SpeciesCategory;
  apiValue?: string;
  label: string;
  icon: IconName;
}[];

export type CategoryFilter = (typeof SPECIES_CATEGORY_FILTERS)[number]['id'];

export const SPECIES_CATEGORY_LABELS: Record<SpeciesCategory, string> = {
  bird: 'Ave',
  plant: 'Planta',
  insect: 'Insecto',
};

/** Códigos de la API, en el orden de la escala UICN (de más a menos amenazada). */
export const CONSERVATION_CODES = ['EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE'] as const;

type ConservationStyle = {
  label: string;
  /** Fondo de la insignia y del punto del chip. */
  background: string;
  /** Texto sobre el fondo. */
  text: string;
};

/**
 * Estado de conservación: etiqueta y colores de cada nivel, según la leyenda del diseño de Figma
 * ("Riesgo de extinción de especies"). `DD` y `NE` no tienen color en el diseño: son provisionales
 * y se confirman con el equipo de diseño.
 */
export const CONSERVATION_STATUSES: Record<ConservationStatus, ConservationStyle> = {
  EX: { label: 'Extinta', background: '#3A433E', text: '#FC0000' },
  EW: { label: 'Extinta en estado silvestre', background: '#000F0A', text: '#F7F8F8' },
  CR: { label: 'En peligro crítico', background: '#D81E05', text: '#FFFFFF' },
  EN: { label: 'En peligro', background: '#FC7F3F', text: '#072219' },
  VU: { label: 'Vulnerable', background: '#F9E814', text: '#5A4E00' },
  NT: { label: 'Casi amenazada', background: '#CCE226', text: '#3D4A00' },
  LC: { label: 'Preocupación menor', background: '#60C659', text: '#072219' },
  DD: { label: 'Datos insuficientes', background: '#ACB9B5', text: '#072219' },
  NE: { label: 'No evaluada', background: '#E3E8E6', text: '#3D514B' },
};

/** Claves de caché de la feature. */
export const speciesKeys = {
  all: ['species'] as const,
  list: (category: CategoryFilter) => [...speciesKeys.all, 'list', category] as const,
  detail: (id: string) => [...speciesKeys.all, 'detail', id] as const,
};
