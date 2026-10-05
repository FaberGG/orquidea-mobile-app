import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

import {
  SPECIES_FORM_CONSERVATION_CODES,
  SPECIES_FORM_LABELS,
  SPECIES_LABELS,
  SPECIES_MESSAGES,
} from '../constants';
import { getSpeciesSaveErrorMessage, useSpecies, useUpdateSpecies } from '../hooks';
import { type SpeciesFormValues } from '../schemas/species-form.schema';
import { type ConservationStatus, type Species } from '../types';
import { SpeciesForm } from './species-form';

/** Valores iniciales del formulario a partir de una ficha existente. */
export function toSpeciesFormValues(species: Species): SpeciesFormValues {
  return {
    photo: null,
    category: species.category,
    vernacularName: species.vernacularName,
    scientificName: species.scientificName,
    order: species.order ?? '',
    family: species.family ?? '',
    genus: species.genus ?? '',
    diet: species.diet ?? '',
    wetlandRole: species.wetlandRole ?? '',
    conservationStatus: species.conservationStatus,
  };
}

/**
 * Estados que se ofrecen al editar: los del diseño más el de la ficha, aunque sea uno que el diseño
 * no muestra (para que la edición no lo cambie sin querer).
 */
function conservationOptionsFor(current: ConservationStatus): ConservationStatus[] {
  const options: ConservationStatus[] = [...SPECIES_FORM_CONSERVATION_CODES];
  return options.includes(current) ? options : [...options, current];
}

/** HU-8: editar una ficha (Figma: "Editar ficha"). Requiere `species:update`. */
export function SpeciesEditScreen({ id }: { id: string }) {
  const { data, isPending, isError, refetch } = useSpecies(id);
  const update = useUpdateSpecies(id);
  const theme = useTheme();

  if (isPending) {
    return (
      <ThemedView style={styles.flex}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.flex}>
        <EmptyState icon="wetland" title={SPECIES_LABELS.loadError}>
          <Button label={SPECIES_LABELS.retry} onPress={() => void refetch()} />
        </EmptyState>
      </ThemedView>
    );
  }

  return (
    <SpeciesForm
      mode="edit"
      title={SPECIES_FORM_LABELS.editTitle}
      submitLabel={SPECIES_FORM_LABELS.editSubmit}
      defaultValues={toSpeciesFormValues(data)}
      existingPhotoUrl={data.photoUrl}
      conservationOptions={conservationOptionsFor(data.conservationStatus)}
      isSubmitting={update.isPending}
      errorMessage={update.isError ? getSpeciesSaveErrorMessage(update.error) : undefined}
      successMessage={update.isSuccess ? SPECIES_MESSAGES.updateSuccess : undefined}
      onSubmit={(input) => update.mutate(input)}
    />
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
