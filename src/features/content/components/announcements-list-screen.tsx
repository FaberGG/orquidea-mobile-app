import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormMessage } from '@/components/feedback/form-message';
import { AppHeader } from '@/components/layout/app-header';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { UnderlineTabs } from '@/components/ui/underline-tabs';
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
import { AnnouncementCard, AnnouncementCardAction } from './announcement-card';
import { CreateAnnouncementButton } from './create-announcement-button';

type AnnouncementsView = 'visible' | 'hidden';

const TABS = [
  { id: 'visible', label: CONTENT_LABELS.announcementsTabVisible },
  { id: 'hidden', label: CONTENT_LABELS.announcementsTabHidden },
] as const satisfies readonly { id: AnnouncementsView; label: string }[];

/**
 * Anuncios (HU-17) unificada con la gestión (SCRUM-71). Pantalla completa fuera de las pestañas: el
 * encabezado trae volver, título y, con `announcements:publish`, el botón "+". Visitantes y usuarios
 * registrados ven solo los anuncios visibles y vigentes. Con `announcements:manage` se ven todos en dos
 * pestañas, Visibles y Ocultos (los ocultos y los expirados, HU-23/HU-24), y cada tarjeta trae EDITAR y
 * OCULTAR o MOSTRAR.
 */
export function AnnouncementsListScreen() {
  const theme = useTheme();
  const canManage = usePermission('announcements:manage');
  const canPublish = usePermission('announcements:publish');
  const { data, error, isError, isPending, isRefetchError, isRefetching, refetch } =
    useAnnouncementList(canManage);
  const changeVisibility = useChangeAnnouncementVisibility();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [view, setView] = useState<AnnouncementsView>('visible');
  const announcements = data ?? [];
  const shown = canManage
    ? announcements.filter((item) => (item.visibility === 'visible') === (view === 'visible'))
    : announcements;
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

  const header = (
    <>
      <AppHeader
        title={CONTENT_LABELS.announcementsTitle}
        leadingIcon="chevronLeft"
        menuAccessibilityLabel={CONTENT_LABELS.announcementsBack}
        onMenuPress={() => router.back()}
        right={canPublish ? <CreateAnnouncementButton /> : undefined}
      />
      {canManage && (
        <View style={styles.tabs}>
          <UnderlineTabs tabs={TABS} value={view} onChange={setView} />
        </View>
      )}
    </>
  );

  if (isPending) {
    return (
      <Screen>
        {header}
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (isError && data === undefined) {
    return (
      <Screen>
        {header}
        <EmptyState icon="announcements" title={getAnnouncementsErrorMessage(error)}>
          <Button label={CONTENT_LABELS.announcementsRetry} onPress={refresh} />
        </EmptyState>
      </Screen>
    );
  }

  const emptyTitle =
    announcements.length === 0
      ? CONTENT_MESSAGES.announcementsEmpty
      : view === 'visible'
        ? CONTENT_MESSAGES.announcementsEmptyVisible
        : CONTENT_MESSAGES.announcementsEmptyHidden;

  if (shown.length === 0) {
    return (
      <Screen>
        {header}
        <View style={styles.emptyContent}>
          {refreshError && <FormMessage message={CONTENT_MESSAGES.announcementsRefreshError} />}
          <EmptyState icon="announcements" title={emptyTitle}>
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

  const hasListHeader = refreshError || changeVisibility.isError;

  return (
    <Screen>
      {header}
      <FlatList<ListedAnnouncement>
        accessibilityLabel={CONTENT_LABELS.announcementsTitle}
        data={shown}
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
          hasListHeader ? (
            <View style={styles.listHeader}>
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
 * Acciones de gestión en cada tarjeta (SCRUM-71). EDITAR abre la edición de prioridad, vigencia y
 * texto. OCULTAR / MOSTRAR (HU-24); los vencidos no se pueden mostrar (la API responde 409), pero sí
 * editar para ponerles una fecha nueva.
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
      <AnnouncementCardAction
        label={CONTENT_LABELS.editButton}
        accessibilityLabel={CONTENT_LABELS.editAnnouncement(announcement.title)}
        disabled={isChanging}
        onPress={() =>
          router.push(`/announcements/${encodeURIComponent(announcement.id)}/edit` as Href)
        }
      />
      {announcement.visibility !== 'expired' && (
        <AnnouncementCardAction
          label={isVisible ? CONTENT_LABELS.hideButton : CONTENT_LABELS.showButton}
          variant="tertiary"
          isLoading={isChanging}
          disabled={isDisabled}
          onPress={onToggleVisibility}
        />
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
  tabs: {
    paddingBottom: Spacing.two,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  listHeader: {
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
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
});
