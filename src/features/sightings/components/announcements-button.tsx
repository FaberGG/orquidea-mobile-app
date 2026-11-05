import { HeaderIconButton } from '@/components/layout/app-header';

import { SIGHTINGS_LABELS } from '../constants';

type AnnouncementsButtonProps = {
  onPress: () => void;
};

/** Campana del encabezado de Comunidad: abre la lista pública de anuncios (HU-17). */
export function AnnouncementsButton({ onPress }: AnnouncementsButtonProps) {
  return (
    <HeaderIconButton
      icon="notifications"
      accessibilityLabel={SIGHTINGS_LABELS.announcements}
      onPress={onPress}
    />
  );
}
