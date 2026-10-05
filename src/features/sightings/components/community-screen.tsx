import { EmptyState } from '@/components/feedback/empty-state';
import { Screen } from '@/components/layout/screen';

import { SIGHTINGS_LABELS } from '../constants';

/**
 * Pestaña "Comunidad" (HE-07): foro de avistamientos aprobados (HU-20), creación de reportes para
 * usuarios registrados (HU-18) y revisión para administradores (HU-19). Por ahora solo ocupa su lugar
 * en el layout.
 */
export function CommunityScreen() {
  return (
    <Screen>
      <EmptyState
        icon="community"
        title={SIGHTINGS_LABELS.placeholderTitle}
        description={SIGHTINGS_LABELS.placeholderDescription}
      />
    </Screen>
  );
}
