import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormMessage } from '@/components/feedback/form-message';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_LABELS, CONTENT_MESSAGES } from '../constants';
import { getAnnouncementsErrorMessage, useAnnouncements } from '../hooks';
import { type Announcement } from '../types';
import { AnnouncementCard } from './announcement-card';

/** HU-17: lista pública de anuncios con estados de carga, error, vacío y refresco. */
export function AnnouncementsListScreen() {
  const theme = useTheme();
  const { data, error, isError, isPending, isRefetchError, isRefetching, refetch } =
    useAnnouncements();
  const announcements = data ?? [];
  const refreshError = isRefetchError;

  const refresh = () => {
    void refetch();
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

  return (
    <Screen>
      <FlatList<Announcement>
        accessibilityLabel={CONTENT_LABELS.announcementsTitle}
        data={announcements}
        keyExtractor={(announcement) => announcement.id}
        renderItem={({ item }) => <AnnouncementCard announcement={item} />}
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
          refreshError ? <FormMessage message={CONTENT_MESSAGES.announcementsRefreshError} /> : null
        }
      />
    </Screen>
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
  separator: {
    height: Spacing.three,
  },
  emptyContent: {
    flex: 1,
  },
});
