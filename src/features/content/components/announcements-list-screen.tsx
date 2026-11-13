import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormMessage } from '@/components/feedback/form-message';
import { Screen } from '@/components/layout/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePermission } from '@/permissions';

import { CONTENT_LABELS, CONTENT_MESSAGES } from '../constants';
import {
  getAnnouncementVisibilityErrorMessage,
  getAnnouncementsErrorMessage,
  useAnnouncementList,
  useChangeAnnouncementVisibility,
} from '../hooks';
import { type ListedAnnouncement } from '../types';
import { AnnouncementCard } from './announcement-card';

/**
 * Anuncios (HU-17) unificada con la gestión (SCRUM-71). Visitantes y usuarios registrados ven solo
 * los anuncios visibles y vigentes. Con `announcements:manage` se ven todos, con su estado (Visible,
 * Oculto o Expirado, HU-23/HU-24), y cada tarjeta trae EDITAR y OCULTAR o MOSTRAR. Publicar sigue en
 * el botón "+" del encabezado (`announcements:publish`).
 */
export function AnnouncementsListScreen() {
  const theme = useTheme();
  const canManage = usePermission('announcements:manage');
  const { data, error, isError, isPending, isRefetchError, isRefetching, refetch } =
    useAnnouncementList(canManage);
  const changeVisibility = useChangeAnnouncementVisibility();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const announcements = data ?? [];
  const refreshError = isRefetchError;

  const refresh = () => {
    void refetch();
  };

  const toggleVisibility = (announcement: ListedAnnouncement) => {
    setPendingId(announcement.id);
    changeVisibility.mutate(
      { id: announcement.id, action: announcement.visibility === 'visible' ? 'hide' : 'show' },
      { onSettled: () => setPendingId(null) },
    );
  };

  if (isPending) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (isError && data === undefined) {
    return (
      <Screen>
        <EmptyState icon="announcements" title={getAnnouncementsErrorMessage(error)}>
          <Button label={CONTENT_LABELS.announcementsRetry} onPress={refresh} />
        </EmptyState>
      </Screen>
    );
  }

  if (announcements.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContent}>
          {refreshError && <FormMessage message={CONTENT_MESSAGES.announcementsRefreshError} />}
          <EmptyState icon="announcements" title={CONTENT_MESSAGES.announcementsEmpty}>
            <Button
              label={CONTENT_LABELS.announcementsRefreshButton}
              onPress={refresh}
              isLoading={isRefetching}
            />
          </EmptyState>
        </View>
      </Screen>
    );
  }

  const hasHeader = canManage || refreshError || changeVisibility.isError;

  return (
    <Screen>
      <FlatList<ListedAnnouncement>
        accessibilityLabel={CONTENT_LABELS.announcementsTitle}
        data={announcements}
        keyExtractor={(announcement) => announcement.id}
        renderItem={({ item }) => (
          <AnnouncementCard announcement={item}>
            {canManage && item.visibility && (
              <ManageActions
                announcement={item}
                isChanging={pendingId === item.id}
                isDisabled={pendingId !== null && pendingId !== item.id}
                onToggleVisibility={() => toggleVisibility(item)}
              />
            )}
          </AnnouncementCard>
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            accessibilityLabel={CONTENT_LABELS.announcementsRefresh}
            refreshing={isRefetching}
            onRefresh={refresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.backgroundElement}
          />
        }
        ListHeaderComponent={
          hasHeader ? (
            <View style={styles.header}>
              {canManage && (
                <ThemedText type="small" themeColor="textSecondary">
                  {CONTENT_LABELS.manageHint}
                </ThemedText>
              )}
              {refreshError && <FormMessage message={CONTENT_MESSAGES.announcementsRefreshError} />}
              {changeVisibility.isError && (
                <FormMessage
                  message={getAnnouncementVisibilityErrorMessage(changeVisibility.error)}
                />
              )}
            </View>
          ) : undefined
        }
      />
    </Screen>
  );
}

/**
 * Acciones de gestión en cada tarjeta (SCRUM-71, antes en "Gestionar anuncios"). EDITAR abre la
 * edición de prioridad, vigencia y texto. OCULTAR / MOSTRAR (HU-24); los vencidos no se pueden
 * mostrar (la API responde 409), pero sí editar para ponerles una fecha nueva.
 */
function ManageActions({
  announcement,
  isChanging,
  isDisabled,
  onToggleVisibility,
}: {
  announcement: ListedAnnouncement;
  isChanging: boolean;
  isDisabled: boolean;
  onToggleVisibility: () => void;
}) {
  const isVisible = announcement.visibility === 'visible';
  return (
    <View style={styles.actions}>
      <View style={styles.action}>
        <Button
          label={CONTENT_LABELS.editButton}
          variant="secondary"
          accessibilityLabel={CONTENT_LABELS.editAnnouncement(announcement.title)}
          disabled={isChanging}
          onPress={() =>
            router.push(`/announcements/${encodeURIComponent(announcement.id)}/edit` as Href)
          }
        />
      </View>
      {announcement.visibility !== 'expired' && (
        <View style={styles.action}>
          <Button
            label={isVisible ? CONTENT_LABELS.hideButton : CONTENT_LABELS.showButton}
            variant={isVisible ? 'secondary' : 'primary'}
            isLoading={isChanging}
            disabled={isDisabled}
            onPress={onToggleVisibility}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  header: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  separator: {
    height: Spacing.three,
  },
  emptyContent: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  action: {
    flex: 1,
  },
});
