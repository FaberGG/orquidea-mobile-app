import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback/empty-state';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/features/auth';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { isApiError } from '@/lib/api';

import { SIGHTINGS_LABELS, SIGHTINGS_MESSAGES } from '../constants';
import { getCreateSightingErrorMessage, useCreateSighting } from '../hooks';
import { enqueueSighting } from '../queue';
import { type SightingInput } from '../types';
import { SightingForm } from './sighting-form';

/** Un fallo de red o de tiempo (no una respuesta de la API) se trata como "sin conexión". */
function isConnectionError(error: unknown): boolean {
  return isApiError(error) && error.kind !== 'http';
}

/**
 * HU-18: crear un reporte de avistamiento. Solo se llega con `sightings:create` (la ruta lo exige).
 * Al enviarlo se muestra la confirmación de CA1: el reporte queda pendiente de revisión.
 *
 * HU-22 CA1: sin red (o si el envío falla por la conexión) el reporte se guarda en el teléfono como
 * "pendiente de sincronización" y se envía solo al volver la señal (`SightingQueueSync`).
 */
export function NewSightingScreen() {
  const create = useCreateSighting();
  const { user } = useSession();
  const { status } = useNetworkStatus();
  const [savedOffline, setSavedOffline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();

  const saveOffline = async (input: SightingInput) => {
    if (!user) return;
    setIsSaving(true);
    setSaveError(undefined);
    try {
      await enqueueSighting(input, user.id);
      setSavedOffline(true);
    } catch {
      setSaveError(SIGHTINGS_MESSAGES.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const submit = (input: SightingInput) => {
    setSaveError(undefined);
    if (status === 'offline') {
      void saveOffline(input);
      return;
    }
    create.mutate(input, {
      onError: (error) => {
        if (isConnectionError(error)) void saveOffline(input);
      },
    });
  };

  if (create.isSuccess || savedOffline) {
    return (
      <ThemedView style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          <EmptyState
            icon="check"
            title={savedOffline ? SIGHTINGS_MESSAGES.savedOffline : SIGHTINGS_MESSAGES.created}
            description={savedOffline ? SIGHTINGS_MESSAGES.savedOfflineDescription : undefined}>
            <View style={styles.actions}>
              <Button label={SIGHTINGS_LABELS.backToCommunity} onPress={() => router.back()} />
            </View>
          </EmptyState>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const apiError =
    create.isError && !isConnectionError(create.error)
      ? getCreateSightingErrorMessage(create.error)
      : undefined;

  return (
    <SightingForm
      isSubmitting={create.isPending || isSaving}
      errorMessage={saveError ?? apiError}
      onSubmit={submit}
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
