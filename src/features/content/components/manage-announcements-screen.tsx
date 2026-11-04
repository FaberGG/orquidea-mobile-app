import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { FontFamily, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ANNOUNCEMENT_PRIORITY_OPTIONS, CONTENT_LABELS, CONTENT_MESSAGES } from '../constants';
import {
  getAnnouncementVisibilityErrorMessage,
  getAnnouncementsErrorMessage,
  useAdminAnnouncements,
  useChangeAnnouncementVisibility,
} from '../hooks';
import { type AdminAnnouncement, type AnnouncementVisibility } from '../types';
import { ContentScreenHeader } from './content-screen-header';
import { formatDate, formatDateTime } from './format-date';

const VISIBILITY_STYLE: Record<
  AnnouncementVisibility,
  { label: string; text: ThemeColor; background: ThemeColor }
> = {
  visible: {
    label: CONTENT_LABELS.visibilityVisible,
    text: 'success',
    background: 'successBackground',
  },
  hidden: {
    label: CONTENT_LABELS.visibilityHidden,
    text: 'textSecondary',
    background: 'backgroundSelected',
  },
  expired: {
    label: CONTENT_LABELS.visibilityExpired,
    text: 'danger',
    background: 'dangerBackground',
  },
};

/**
 * HU-24: vista del administrador con todos los anuncios y su estado ('Visible', 'Oculto' o 'Expirado'
 * de HU-23). OCULTAR retira un anuncio visible de la sección de anuncios (CA1) y MOSTRAR devuelve uno
 * oculto que no haya expirado (CA2). Los vencidos no tienen acción: la API no permite mostrarlos.
 */
export function ManageAnnouncementsScreen() {
  const theme = useTheme();
  const { data, error, isPending, isError, refetch } = useAdminAnnouncements();
  const change = useChangeAnnouncementVisibility();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const onChange = (announcement: AdminAnnouncement) => {
    setPendingId(announcement.id);
    change.mutate(
      { id: announcement.id, action: announcement.visibility === 'visible' ? 'hide' : 'show' },
      { onSettled: () => setPendingId(null) },
    );
  };

  return (
    <FormScreen>
      <ContentScreenHeader title={CONTENT_LABELS.manageTitle} />
      <ThemedText type="small" themeColor="textSecondary">
        {CONTENT_LABELS.manageSubtitle}
      </ThemedText>

      {change.isError && (
        <FormMessage message={getAnnouncementVisibilityErrorMessage(change.error)} />
      )}

      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : isError ? (
        <EmptyState icon="announcements" title={getAnnouncementsErrorMessage(error)}>
          <Button label={CONTENT_LABELS.manageRetry} onPress={() => void refetch()} />
        </EmptyState>
      ) : data.length === 0 ? (
        <EmptyState icon="announcements" title={CONTENT_MESSAGES.announcementsAdminEmpty} />
      ) : (
        <View style={styles.list}>
          {data.map((announcement) => (
            <ManagedAnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isChanging={pendingId === announcement.id}
              isDisabled={pendingId !== null && pendingId !== announcement.id}
              onChange={() => onChange(announcement)}
            />
          ))}
        </View>
      )}
    </FormScreen>
  );
}

function ManagedAnnouncementCard({
  announcement,
  isChanging,
  isDisabled,
  onChange,
}: {
  announcement: AdminAnnouncement;
  isChanging: boolean;
  isDisabled: boolean;
  onChange: () => void;
}) {
  const theme = useTheme();
  const visibility = VISIBILITY_STYLE[announcement.visibility];
  const priority = ANNOUNCEMENT_PRIORITY_OPTIONS.find((item) => item.id === announcement.priority);
  const publishedAt = formatDate(announcement.publishedAt);
  const expiresAt = announcement.expiresAt
    ? formatDateTime(new Date(announcement.expiresAt))
    : null;
  const expiresLabel = expiresAt
    ? `${announcement.visibility === 'expired' ? CONTENT_LABELS.expiredPrefix : CONTENT_LABELS.expiresPrefix} ${expiresAt}`
    : CONTENT_LABELS.noExpiration;

  return (
    <View
      accessibilityLabel={`${announcement.title}, ${visibility.label}`}
      style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.titleRow}>
        <ThemedText style={styles.title} themeColor="textLabel" numberOfLines={2}>
          {announcement.title}
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: theme[visibility.background] }]}>
          <ThemedText type="captionBold" themeColor={visibility.text}>
            {visibility.label}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="caption" themeColor="textMuted">
        {[
          priority && `${CONTENT_LABELS.priorityPrefix} ${priority.label.toLowerCase()}`,
          publishedAt && `${CONTENT_LABELS.announcementsPublishedPrefix} ${publishedAt}`,
          expiresLabel,
        ]
          .filter(Boolean)
          .join(' · ')}
      </ThemedText>

      <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
        {announcement.description}
      </ThemedText>

      {announcement.visibility !== 'expired' && (
        <Button
          label={
            announcement.visibility === 'visible'
              ? CONTENT_LABELS.hideButton
              : CONTENT_LABELS.showButton
          }
          variant={announcement.visibility === 'visible' ? 'secondary' : 'primary'}
          isLoading={isChanging}
          disabled={isDisabled}
          onPress={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  list: {
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
  },
});
