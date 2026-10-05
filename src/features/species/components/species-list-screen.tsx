import { EmptyState } from '@/components/feedback/empty-state';
import { Screen } from '@/components/layout/screen';

import { SPECIES_LABELS } from '../constants';

/**
 * Pestaña "Inicio": listado de fichas taxonómicas por categoría (HU-10). Por ahora solo ocupa su
 * lugar en el layout; el listado, los filtros y las tarjetas del Figma ("Listar fichas") llegan con
 * la implementación de HU-10.
 */
export function SpeciesListScreen() {
  return (
    <Screen>
      <EmptyState
        icon="wetland"
        title={SPECIES_LABELS.listPlaceholderTitle}
        description={SPECIES_LABELS.listPlaceholderDescription}
      />
    </Screen>
  );
}
