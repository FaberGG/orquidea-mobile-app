import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_LABELS } from '../constants';
import { type AnnouncementPriority, type ListedAnnouncement } from '../types';
import { formatExpiration, formatRelativeTime } from './format-date';

type AnnouncementCardProps = {
  announcement: ListedAnnouncement;
  /** Acciones al pie (solo para quien gestiona anuncios, SCRUM-71). */
  children?: ReactNode;
  /** Instante de referencia para las fechas relativas (se reemplaza en pruebas). */
  now?: Date;
};

/** Franja de prioridad: la alta es lo único saturado de la tarjeta; media y baja son discretas. */
const PRIORITY_BAND: Record<AnnouncementPriority, { background: ThemeColor; text: ThemeColor }> = {
  high: { background: 'danger', text: 'onPrimary' },
  medium: { background: 'warningBackground', text: 'warning' },
  low: { background: 'backgroundSelected', text: 'textLabel' },
};

/** Cuerpo atenuado cuando el anuncio no se ve en la lista pública (oculto o expirado). */
const INACTIVE_BODY_OPACITY = 0.6;

/**
 * Tarjeta de anuncio en tres franjas: cabecera de prioridad con la fecha relativa de creación, cuerpo
 * (título, descripción y vigencia) y, para quien gestiona anuncios, la fila de acciones (`children`).
 * Un anuncio expirado usa la franja discreta con la etiqueta "· Expirado"; si está oculto o expirado el
 * cuerpo se atenúa, pero las acciones no, para que se sigan usando sin parecer deshabilitadas.
 */
export function AnnouncementCard({
  announcement,
  children,
  now = new Date(),
}: AnnouncementCardProps) {
  const theme = useTheme();
  const isExpired = announcement.visibility === 'expired';
  const isInactive = isExpired || announcement.visibility === 'hidden';
  const band = PRIORITY_BAND[isExpired ? 'low' : announcement.priority];
  const priorityLabel = CONTENT_LABELS.announcementBandLabel(announcement.priority);

  return (
    <View
      accessibilityLabel={
        announcement.visibility
          ? CONTENT_LABELS.visibilityState(
              announcement.visibility === 'visible'
                ? CONTENT_LABELS.visibilityVisible
                : announcement.visibility === 'hidden'
                  ? CONTENT_LABELS.visibilityHidden
                  : CONTENT_LABELS.visibilityExpired,
            )
          : undefined
      }
      style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={[styles.band, { backgroundColor: theme[band.background] }]}>
        <ThemedText
          accessibilityLabel={CONTENT_LABELS.announcementPriority(announcement.priority)}
          style={[styles.priority, { color: theme[band.text] }]}>
          {(isExpired
            ? `${priorityLabel} · ${CONTENT_LABELS.visibilityExpired}`
            : priorityLabel
          ).toUpperCase()}
        </ThemedText>
        <ThemedText style={[styles.date, { color: theme[band.text] }]}>
          {formatRelativeTime(announcement.publishedAt, now)}
        </ThemedText>
      </View>

      <View style={[styles.body, isInactive && { opacity: INACTIVE_BODY_OPACITY }]}>
        <ThemedText themeColor="textLabel" accessibilityRole="header" style={styles.title}>
          {announcement.title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description} selectable>
          {announcement.description}
        </ThemedText>
        {announcement.expiresAt && (
          <ThemedText themeColor="textSecondary" style={styles.expiration}>
            {formatExpiration(announcement.expiresAt, now)}
          </ThemedText>
        )}
      </View>

      {children}
    </View>
  );
}

type CardActionProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** `secondary`: fondo de la tarjeta con borde. `tertiary`: fondo gris suave, sin borde. */
  variant?: 'secondary' | 'tertiary';
  isLoading?: boolean;
};

/** Botón de la fila de acciones de la tarjeta: sin ícono, sin color de énfasis, de 44 px de alto. */
export function AnnouncementCardAction({
  label,
  variant = 'secondary',
  isLoading = false,
  disabled,
  ...rest
}: CardActionProps) {
  const theme = useTheme();
  const isDisabled = Boolean(disabled) || isLoading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.action,
        variant === 'secondary'
          ? { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }
          : { backgroundColor: theme.backgroundSelected },
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      {...rest}>
      {isLoading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <ThemedText themeColor="textLabel" style={styles.actionLabel}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
  },
  priority: {
    flexShrink: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  date: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    gap: 6,
    paddingTop: 14,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    lineHeight: 23,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  expiration: {
    paddingTop: Spacing.one,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  action: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  actionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
