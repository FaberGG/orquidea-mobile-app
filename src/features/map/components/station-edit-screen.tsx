import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

import { STATION_LABELS, STATION_MESSAGES } from '../constants';
import { getStationSaveErrorMessage, useStation, useUpdateStation } from '../hooks';
import { type StationFormValues } from '../schemas/station-form.schema';
import { type Station } from '../types';
import { StationForm } from './station-form';

/** Valores iniciales del formulario a partir de una estación existente. */
export function toStationFormValues(station: Station): StationFormValues {
  return {
    name: station.name,
    description: station.description,
    latitude: String(station.location.latitude),
    longitude: String(station.location.longitude),
    photo: null,
    speciesIds: station.species.map((species) => species.id),
  };
}

/** HU-13 CA2: editar una estación (GUARDAR CAMBIOS). Requiere `stations:manage`. */
export function StationEditScreen({ id }: { id: string }) {
  const { data, isPending, isError, refetch } = useStation(id);
  const update = useUpdateStation(id);
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
        <EmptyState icon="location" title={STATION_MESSAGES.loadError}>
          <Button label={STATION_LABELS.retry} onPress={() => void refetch()} />
          <Button label={STATION_LABELS.back} variant="link" onPress={() => router.back()} />
        </EmptyState>
      </ThemedView>
    );
  }

  return (
    <StationForm
      mode="edit"
      title={STATION_LABELS.editTitle}
      submitLabel={STATION_LABELS.editSubmit}
      defaultValues={toStationFormValues(data)}
      savedPhotoUrl={data.photoUrl}
      isSubmitting={update.isPending}
      errorMessage={update.isError ? getStationSaveErrorMessage(update.error) : undefined}
      successMessage={update.isSuccess ? STATION_MESSAGES.updated : undefined}
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
