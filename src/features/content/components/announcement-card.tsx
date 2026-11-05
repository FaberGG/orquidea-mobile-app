import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_LABELS } from '../constants';
import { type Announcement } from '../types';

type AnnouncementCardProps = {
  announcement: Announcement;
};

function formatPublishedDate(value: string): string {
  return new Date(value).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Bogota',
    year: 'numeric',
  });
}

function formatExpirationDate(value: string): string {
  const date = new Date(value);
  const time = date.toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota',
  });
  return `${formatPublishedDate(value)}, ${time}`;
}

/** Tarjeta de lectura pública: título, contenido y metadatos al final. */
export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const theme = useTheme();
  const priorityStyle =
    announcement.priority === 'high'
      ? { backgroundColor: theme.dangerBackground, color: theme.danger }
      : announcement.priority === 'medium'
        ? { backgroundColor: theme.primarySoft, color: theme.primary }
        : { backgroundColor: theme.backgroundElement, color: theme.textSecondary };

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.heading}>
        <ThemedText
          type="default"
          themeColor="textLabel"
          accessibilityRole="header"
          style={styles.title}>
          {announcement.title}
        </ThemedText>
        <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.backgroundColor }]}>
          <ThemedText
            type="captionBold"
            accessibilityLabel={CONTENT_LABELS.announcementPriority(announcement.priority)}
            style={{ color: priorityStyle.color }}>
            {CONTENT_LABELS.announcementPriorityLabel(announcement.priority)}
          </ThemedText>
        </View>
      </View>
      <ThemedText type="default" themeColor="text" style={styles.description} selectable>
        {announcement.description}
      </ThemedText>
      <View style={[styles.metadata, { borderTopColor: theme.border }]}>
        <ThemedText type="caption" themeColor="textMuted">
          {`${CONTENT_LABELS.announcementsPublishedPrefix} ${formatPublishedDate(announcement.publishedAt)}${announcement.publisherName ? ` · ${CONTENT_LABELS.announcementsPublisherPrefix} ${announcement.publisherName}` : ''}`}
        </ThemedText>
        {announcement.expiresAt && (
          <ThemedText type="caption" themeColor="textMuted">
            {`${CONTENT_LABELS.announcementsAvailableUntilPrefix} ${formatExpirationDate(announcement.expiresAt)}`}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
  },
  description: {
    paddingVertical: Spacing.one,
  },
  metadata: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  priorityBadge: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.full,
  },
});
