import { HeaderIconButton } from '@/components/layout/app-header';

import { SIGHTINGS_LABELS } from '../constants';

/**
 * Campana del encabezado de Comunidad (Figma: "Anuncios"). Abrirá los anuncios del humedal (HU-17),
 * que aún están en desarrollo: por ahora solo ocupa su lugar en el diseño.
 */
export function AnnouncementsButton() {
  return (
    <HeaderIconButton
      icon="notifications"
      accessibilityLabel={SIGHTINGS_LABELS.announcements}
      // HU-17 en desarrollo: sin destino todavía (ver docs/sprints/he-07-pendientes.md).
      onPress={() => undefined}
    />
  );
}
