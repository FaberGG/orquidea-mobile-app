import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/features/auth';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useTheme } from '@/hooks/use-theme';

import { KINGDOM_LABELS, SIGHTINGS_LABELS } from '../constants';
import { useQueuedSightings } from '../hooks';
import {
  removeQueuedSighting,
  retryQueuedSighting,
  type QueuedSighting,
  type QueuedSightingStatus,
} from '../queue';
import { formatSightingDate } from './format-sighting';

const STATUS_LABEL: Record<QueuedSightingStatus, string> = {
  pending: SIGHTINGS_LABELS.queueStatusPending,
  failed: SIGHTINGS_LABELS.queueStatusFailed,
  'needs-login': SIGHTINGS_LABELS.queueStatusNeedsLogin,
};

/**
 * HU-22: reportes del usuario guardados en el teléfono que aún no llegan a la API, con su estado y
 * las opciones REINTENTAR y DESCARTAR. No aparece si no hay ninguno.
 */
export function QueuedSightingsSection() {
  const { user, isAuthenticated } = useSession();
  const items = useQueuedSightings(isAuthenticated ? user?.id : undefined);
  const { status } = useNetworkStatus();

  if (items.length === 0) return null;

  return (
    <View style={styles.section} accessibilityLabel={SIGHTINGS_LABELS.queueTitle}>
      <ThemedText type="smallSemiBold">
        {`${SIGHTINGS_LABELS.queueTitle} (${items.length})`}
      </ThemedText>
      {items.map((item) => (
        <QueuedSightingCard key={item.id} item={item} isOffline={status === 'offline'} />
      ))}
    </View>
  );
}

function QueuedSightingCard({ item, isOffline }: { item: QueuedSighting; isOffline: boolean }) {
  const theme = useTheme();
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);
  const savedAt = formatSightingDate(item.createdAt);
  const statusColor = item.status === 'pending' ? 'textSecondary' : 'danger';
  const details = [
    KINGDOM_LABELS[item.input.kingdom],
    item.input.photo ? SIGHTINGS_LABELS.queueWithPhoto : null,
    savedAt ? SIGHTINGS_LABELS.queueSavedAt(savedAt) : null,
  ].filter(Boolean);

  return (
    <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.background }]}>
      <ThemedText type="small" numberOfLines={2}>
        {item.input.remarks}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {details.join(' · ')}
      </ThemedText>
      <ThemedText type="smallSemiBold" themeColor={statusColor}>
        {STATUS_LABEL[item.status]}
      </ThemedText>
      {item.status === 'failed' && item.errorMessage && (
        <ThemedText type="small" themeColor="danger">
          {item.errorMessage}
        </ThemedText>
      )}

      {isConfirmingDiscard ? (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {SIGHTINGS_LABELS.queueDiscardQuestion}
          </ThemedText>
          <View style={styles.actions}>
            <SmallButton
              label={SIGHTINGS_LABELS.cancel}
              onPress={() => setIsConfirmingDiscard(false)}
            />
            <SmallButton
              label={SIGHTINGS_LABELS.queueDiscardConfirm}
              danger
              onPress={() => void removeQueuedSighting(item.id)}
            />
          </View>
        </>
      ) : (
        <View style={styles.actions}>
          <SmallButton
            label={SIGHTINGS_LABELS.queueDiscard}
            danger
            onPress={() => setIsConfirmingDiscard(true)}
          />
          <SmallButton
            label={SIGHTINGS_LABELS.queueRetry}
            disabled={isOffline}
            onPress={() => void retryQueuedSighting(item.id)}
          />
        </View>
      )}
    </View>
  );
}

function SmallButton({
  label,
  danger = false,
  disabled = false,
  onPress,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const color = danger ? theme.danger : theme.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: color },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <ThemedText style={[styles.buttonLabel, { color }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  card: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MinTouchSize,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  buttonLabel: {
    fontFamily: FontFamily.bold,
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
