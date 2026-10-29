import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';

import { type CreateSpeciesResult } from '../api';
import {
  SPECIES_FORM_CONSERVATION_CODES,
  SPECIES_FORM_LABELS,
  SPECIES_LABELS,
  SPECIES_MESSAGES,
} from '../constants';
import { getSpeciesSaveErrorMessage, useCreateSpecies } from '../hooks';
import { SpeciesForm } from './species-form';
import { type SpeciesFormValues } from '../schemas/species-form.schema';

export const EMPTY_SPECIES_FORM_VALUES: SpeciesFormValues = {
  newPhotos: [],
  removedPhotoIds: [],
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
 * `(admin)` ya lo exige. Al publicarla, vuelve al listado. Si la ficha se creó pero alguna foto adicional
 * no se subió, lo avisa y ofrece completarla desde Editar ficha (no se puede reintentar la creación).
 */
export function SpeciesCreateScreen() {
  const create = useCreateSpecies();
  const [partial, setPartial] = useState<CreateSpeciesResult | null>(null);

  if (partial) {
    const { id } = partial.species;
    return (
      <ThemedView style={styles.flex}>
        <EmptyState
          icon="imagePlus"
          title={SPECIES_MESSAGES.photosPartiallySaved(partial.pendingPhotos.length)}>
          <Button
            label={SPECIES_LABELS.editButton}
            onPress={() => router.replace({ pathname: '/species/[id]/edit', params: { id } })}
          />
          <Button
            label={SPECIES_LABELS.backToList}
            variant="link"
            onPress={() => router.replace('/')}
          />
        </EmptyState>
      </ThemedView>
    );
  }

  return (
    <SpeciesForm
      mode="create"
      title={SPECIES_FORM_LABELS.createTitle}
      submitLabel={SPECIES_FORM_LABELS.createSubmit}
      defaultValues={EMPTY_SPECIES_FORM_VALUES}
      savedPhotos={[]}
      conservationOptions={SPECIES_FORM_CONSERVATION_CODES}
      isSubmitting={create.isPending}
      errorMessage={create.isError ? getSpeciesSaveErrorMessage(create.error) : undefined}
      onSubmit={(input) =>
        create.mutate(input, {
          onSuccess: (result) => {
            if (result.pendingPhotos.length > 0) setPartial(result);
            else router.replace('/');
          },
        })
      }
    />
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
