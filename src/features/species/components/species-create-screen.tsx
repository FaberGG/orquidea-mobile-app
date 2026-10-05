import { router } from 'expo-router';

import { SPECIES_FORM_CONSERVATION_CODES, SPECIES_FORM_LABELS } from '../constants';
import { getSpeciesSaveErrorMessage, useCreateSpecies } from '../hooks';
import { SpeciesForm } from './species-form';
import { type SpeciesFormValues } from '../schemas/species-form.schema';

export const EMPTY_SPECIES_FORM_VALUES: SpeciesFormValues = {
  photo: null,
  category: null,
  vernacularName: '',
  scientificName: '',
  order: '',
  family: '',
  genus: '',
  diet: '',
  wetlandRole: '',
  conservationStatus: null,
};

/**
 * HU-7: crear una ficha (Figma: "Crear ficha"). Solo se llega aquí con `species:create`, y la ruta
 * `(admin)` ya lo exige. Al publicarla, vuelve al listado.
 */
export function SpeciesCreateScreen() {
  const create = useCreateSpecies();

  return (
    <SpeciesForm
      mode="create"
      title={SPECIES_FORM_LABELS.createTitle}
      submitLabel={SPECIES_FORM_LABELS.createSubmit}
      defaultValues={EMPTY_SPECIES_FORM_VALUES}
      existingPhotoUrl={null}
      conservationOptions={SPECIES_FORM_CONSERVATION_CODES}
      isSubmitting={create.isPending}
      errorMessage={create.isError ? getSpeciesSaveErrorMessage(create.error) : undefined}
      onSubmit={(input) =>
        create.mutate(input, {
          onSuccess: () => router.replace('/'),
        })
      }
    />
  );
}
