import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback/empty-state';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

import { SIGHTINGS_LABELS, SIGHTINGS_MESSAGES } from '../constants';
import { getCreateSightingErrorMessage, useCreateSighting } from '../hooks';
import { SightingForm } from './sighting-form';

/**
 * HU-18: crear un reporte de avistamiento. Solo se llega con `sightings:create` (la ruta lo exige).
 * Al enviarlo se muestra la confirmación de CA1: el reporte queda pendiente de revisión.
 */
export function NewSightingScreen() {
  const create = useCreateSighting();

  if (create.isSuccess) {
    return (
      <ThemedView style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          <EmptyState icon="check" title={SIGHTINGS_MESSAGES.created}>
            <View style={styles.actions}>
              <Button label={SIGHTINGS_LABELS.backToCommunity} onPress={() => router.back()} />
            </View>
          </EmptyState>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <SightingForm
      isSubmitting={create.isPending}
      errorMessage={create.isError ? getCreateSightingErrorMessage(create.error) : undefined}
      onSubmit={(input) => create.mutate(input)}
    />
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  actions: {
    alignSelf: 'stretch',
    paddingTop: Spacing.three,
  },
});
