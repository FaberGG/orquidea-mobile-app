import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { FontFamily, MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SIGHTINGS_LABELS } from '../constants';
import { getReviewSightingErrorMessage, type ReviewDecision, useReviewSighting } from '../hooks';
import { type Sighting } from '../types';
import { formatSightingDate } from './format-sighting';
import { SightingAuthor } from './sighting-author';
import { SightingDetails } from './sighting-details';

const PHOTO_HEIGHT = 220;

export type PendingSightingCardProps = {
  sighting: Sighting;
};

/**
 * Reporte en la cola de revisión (HU-19, Figma: "Comunidad · Administrador · Pendientes"). Se marca
 * como pendiente (CA3) hasta que el administrador lo aprueba (CA1) o lo rechaza (CA2). El rechazo no
 * se puede deshacer, así que se confirma en la misma tarjeta.
 */
export function PendingSightingCard({ sighting }: PendingSightingCardProps) {
  const theme = useTheme();
  const review = useReviewSighting();
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const [decision, setDecision] = useState<ReviewDecision | null>(null);

  const submit = (next: ReviewDecision) => {
    setDecision(next);
    review.mutate({ id: sighting.id, decision: next });
  };

  const sentAt = formatSightingDate(sighting.createdAt);
  const { photoUrl } = sighting;

  return (
    <View style={[styles.card, { backgroundColor: theme.background, shadowColor: theme.text }]}>
      <SightingAuthor
        name={sighting.author}
        subtitle={
          sentAt ? `${SIGHTINGS_LABELS.pendingStatus} · ${sentAt}` : SIGHTINGS_LABELS.pendingStatus
        }
      />

      {photoUrl && (
        <Pressable
          accessibilityRole="imagebutton"
          accessibilityLabel={SIGHTINGS_LABELS.openPhoto}
          onPress={() => router.push({ pathname: '/sightings/photo', params: { uri: photoUrl } })}
          style={[styles.photo, { backgroundColor: theme.backgroundSelected }]}>
          <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        </Pressable>
      )}

      <SightingDetails
        remarks={sighting.remarks}
        kingdom={sighting.kingdom}
        vernacularName={sighting.vernacularName}
        location={sighting.location}
      />

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        {review.isError && <FormMessage message={getReviewSightingErrorMessage(review.error)} />}

        {isConfirmingReject ? (
          <>
            <ThemedText type="small" themeColor="textSecondary">
              {SIGHTINGS_LABELS.rejectConfirmQuestion}
            </ThemedText>
            <View style={styles.actions}>
              <ActionButton
                label={SIGHTINGS_LABELS.cancel}
                variant="neutral"
                disabled={review.isPending}
                onPress={() => setIsConfirmingReject(false)}
              />
              <ActionButton
                label={SIGHTINGS_LABELS.rejectConfirm}
                icon="delete"
                variant="danger"
                isLoading={review.isPending && decision === 'reject'}
                disabled={review.isPending}
                onPress={() => submit('reject')}
              />
            </View>
          </>
        ) : (
          <View style={styles.actions}>
            <ActionButton
              label={SIGHTINGS_LABELS.reject}
              icon="delete"
              variant="danger"
              disabled={review.isPending}
              onPress={() => setIsConfirmingReject(true)}
            />
            <ActionButton
              label={SIGHTINGS_LABELS.approve}
              icon="check"
              variant="primary"
              isLoading={review.isPending && decision === 'approve'}
              disabled={review.isPending}
              onPress={() => submit('approve')}
            />
          </View>
        )}
      </View>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  icon?: IconName;
  variant: 'primary' | 'danger' | 'neutral';
  isLoading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

/** Botón de moderación (Figma: "btn-aprobar" verde y "btn-rechazar" con borde rojo). */
function ActionButton({
  label,
  icon,
  variant,
  isLoading = false,
  disabled = false,
  onPress,
}: ActionButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const color = isPrimary ? 'onPrimary' : variant === 'danger' ? 'danger' : 'textSecondary';
  const borderColor = variant === 'danger' ? theme.danger : theme.border;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: isLoading }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        isPrimary
          ? { backgroundColor: theme.primary, borderColor: theme.primary }
          : { backgroundColor: theme.background, borderColor },
        disabled && !isLoading && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {isLoading ? (
        <ActivityIndicator color={theme[color]} />
      ) : (
        <>
          {icon && <Icon name={icon} size={18} color={color} />}
          <ThemedText style={[styles.actionLabel, { color: theme[color] }]}>{label}</ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: Spacing.three,
    borderRadius: Radius.card,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  photo: {
    height: PHOTO_HEIGHT,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  footer: {
    gap: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: MinTouchSize,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  actionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});
