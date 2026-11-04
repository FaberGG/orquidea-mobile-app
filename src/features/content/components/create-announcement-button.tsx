import { router } from 'expo-router';

import { HeaderIconButton } from '@/components/layout/app-header';
import { Can } from '@/permissions';

import { CONTENT_LABELS } from '../constants';

/**
 * Acta 17: opción de nuevo anuncio dentro de la lista de anuncios. Botón "+" del encabezado de
 * Anuncios (como el de fichas); solo lo ven los roles con `announcements:publish` (HU-16).
 */
export function CreateAnnouncementButton() {
  return (
    <Can permission="announcements:publish">
      <HeaderIconButton
        icon="add"
        accessibilityLabel={CONTENT_LABELS.publishTitle}
        onPress={() => router.push('/announcements/new')}
      />
    </Can>
  );
}
