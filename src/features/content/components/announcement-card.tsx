import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
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

/** Tarjeta de lectura pública: título, fecha y texto completo del anuncio. */
export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <ThemedText type="smallBold" themeColor="textLabel" accessibilityRole="header">
        {announcement.title}
      </ThemedText>
      <ThemedText type="caption" themeColor="textMuted">
        {`${CONTENT_LABELS.announcementsPublishedPrefix} ${formatPublishedDate(announcement.publishedAt)}`}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" selectable>
        {announcement.description}
      </ThemedText>
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
});
