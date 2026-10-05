import { EmptyState } from '@/components/feedback/empty-state';
import { Screen } from '@/components/layout/screen';

import { MAP_LABELS } from '../constants';

/**
 * Pestaña "Mapas" (HE-05): mapa interactivo con las estaciones del sendero (HU-12) y su gestión para
 * administradores (HU-13). Por ahora solo ocupa su lugar en el layout.
 */
export function MapScreen() {
  return (
    <Screen>
      <EmptyState
        icon="map"
        title={MAP_LABELS.placeholderTitle}
        description={MAP_LABELS.placeholderDescription}
      />
    </Screen>
  );
}
