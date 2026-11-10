import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_LABELS } from '../constants';
import { type AnnouncementVisibility, type ListedAnnouncement } from '../types';

type AnnouncementCardProps = {
  announcement: ListedAnnouncement;
  /** Acciones al pie (solo para quien gestiona anuncios, SCRUM-71). */
  children?: ReactNode;
};

/** Estado que solo ve quien gestiona anuncios (HU-23 CA4 y HU-24). */
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

/**
 * Tarjeta de anuncio: título con el chip de prioridad, contenido y metadatos al final. Los de prioridad
 * alta llevan además un borde del color del chip para que resalten en la lista (SCRUM-71). Si el
 * anuncio trae `visibility`, se muestra su estado (Visible, Oculto o Expirado) junto a la prioridad.
 */
export function AnnouncementCard({ announcement, children }: AnnouncementCardProps) {
  const theme = useTheme();
  const priorityStyle =
    announcement.priority === 'high'
      ? { backgroundColor: theme.dangerBackground, color: theme.danger }
      : announcement.priority === 'medium'
        ? { backgroundColor: theme.primarySoft, color: theme.primary }
        : { backgroundColor: theme.backgroundElement, color: theme.textSecondary };

  const isHighPriority = announcement.priority === 'high';
  const visibility = announcement.visibility ? VISIBILITY_STYLE[announcement.visibility] : null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.background, borderColor: theme.border },
        isHighPriority && [styles.highlighted, { borderLeftColor: theme.danger }],
      ]}>
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
      {visibility && (
        <View
          style={[styles.visibilityBadge, { backgroundColor: theme[visibility.background] }]}
          accessibilityLabel={CONTENT_LABELS.visibilityState(visibility.label)}>
          <ThemedText type="captionBold" themeColor={visibility.text}>
            {visibility.label}
          </ThemedText>
        </View>
      )}
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
      {children}
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
  highlighted: {
    borderLeftWidth: 4,
  },
  visibilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  priorityBadge: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.full,
  },
});
