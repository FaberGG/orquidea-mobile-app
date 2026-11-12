import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_LABELS, CONTENT_MESSAGES } from '../constants';
import {
  getAnnouncementsErrorMessage,
  getUpdateAnnouncementErrorMessage,
  useAdminAnnouncements,
  useUpdateAnnouncement,
} from '../hooks';
import { type AdminAnnouncement, type AnnouncementChanges, type AnnouncementInput } from '../types';
import { AnnouncementForm } from './announcement-form';

/** Solo lo que cambió frente al anuncio guardado: la API conserva lo que no se envía. */
export function getAnnouncementChanges(
  current: AdminAnnouncement,
  values: AnnouncementInput,
): AnnouncementChanges {
  const changes: AnnouncementChanges = {};
  if (values.title.trim() !== current.title) changes.title = values.title;
  if (values.description.trim() !== current.description) changes.description = values.description;
  if (values.priority !== current.priority) changes.priority = values.priority;
  const currentExpiresAt = current.expiresAt ? new Date(current.expiresAt).getTime() : null;
  if (values.expiresAt !== null && values.expiresAt.getTime() !== currentExpiresAt) {
    changes.expiresAt = values.expiresAt;
  }
  return changes;
}

/**
 * SCRUM-71: editar la prioridad, la vigencia o el texto de un anuncio desde la lista unificada. Solo
 * se llega con `announcements:manage`. Toma el anuncio de la lista del administrador (ya en caché si
 * se viene desde Anuncios). Una fecha de finalización ya puesta se puede cambiar, pero no quitar.
 */
export function EditAnnouncementScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, isPending, isError, refetch } = useAdminAnnouncements();
  const update = useUpdateAnnouncement();
  const [hasSaved, setHasSaved] = useState(false);
  const announcement = data?.find((item) => item.id === id);
  const expiresAtIso = announcement?.expiresAt ?? null;
  const currentExpiresAt = useMemo(
    () => (expiresAtIso ? new Date(expiresAtIso) : null),
    [expiresAtIso],
  );

  if (isPending) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (isError || !announcement) {
    return (
      <Screen>
        <EmptyState
          icon="announcements"
          title={
            isError ? getAnnouncementsErrorMessage(error) : CONTENT_MESSAGES.announcementNotFound
          }>
          {isError && (
            <Button label={CONTENT_LABELS.announcementsRetry} onPress={() => void refetch()} />
          )}
        </EmptyState>
      </Screen>
    );
  }

  return (
    <AnnouncementForm
      key={announcement.id}
      title={CONTENT_LABELS.editTitle}
      subtitle={CONTENT_LABELS.editSubtitle}
      submitLabel={CONTENT_LABELS.saveButton}
      defaultValues={{
        title: announcement.title,
        description: announcement.description,
        priority: announcement.priority,
        expiresAt: currentExpiresAt,
      }}
      currentExpiresAt={currentExpiresAt}
      canClearExpiration={currentExpiresAt === null}
      isPending={update.isPending}
      serverError={update.isError ? getUpdateAnnouncementErrorMessage(update.error) : undefined}
      successMessage={hasSaved ? CONTENT_MESSAGES.announcementUpdated : undefined}
      onEdit={() => setHasSaved(false)}
      onSubmit={(values, reset) => {
        setHasSaved(false);
        const changes = getAnnouncementChanges(announcement, values);
        if (Object.keys(changes).length === 0) {
          setHasSaved(true);
          return;
        }
        update.mutate(
          { id: announcement.id, changes },
          {
            onSuccess: () => {
              reset(values);
              setHasSaved(true);
            },
          },
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
