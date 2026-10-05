import { router } from 'expo-router';

import { HeaderIconButton } from '@/components/layout/app-header';
import { Can } from '@/permissions';

import { SPECIES_FORM_LABELS } from '../constants';

/**
 * Botón "+" del encabezado del listado (ocupa el lugar del buscador descartado). Solo lo ven los roles
 * con `species:create`: administrador y superadministrador.
 */
export function CreateSpeciesButton() {
  return (
    <Can permission="species:create">
      <HeaderIconButton
        icon="add"
        accessibilityLabel={SPECIES_FORM_LABELS.createTitle}
        onPress={() => router.push('/species/new')}
      />
    </Can>
  );
}
