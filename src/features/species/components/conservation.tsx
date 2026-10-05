import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, Radius, Spacing } from '@/constants/theme';

import { CONSERVATION_STATUSES } from '../constants';
import { type ConservationStatus } from '../types';

export type ConservationBadgeProps = {
  status: ConservationStatus;
  size?: number;
};

/** Insignia circular con el código UICN (`CR`, `LC`…) sobre el color de su nivel. */
export function ConservationBadge({ status, size = 32 }: ConservationBadgeProps) {
  const style = CONSERVATION_STATUSES[status];
  return (
    <View
      accessible
      accessibilityLabel={`${style.label} (${status})`}
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: style.background },
      ]}>
      <ThemedText style={[styles.badgeText, { color: style.text }]}>{status}</ThemedText>
    </View>
  );
}

/** Chip con punto de color y el nombre del nivel. */
export function ConservationChip({ status }: { status: ConservationStatus }) {
  const style = CONSERVATION_STATUSES[status];
  return (
    <View style={styles.chip}>
      <View style={[styles.dot, { backgroundColor: style.background }]} />
      <ThemedText type="captionBold" themeColor="textSecondary">
        {style.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: 10,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(11, 111, 80, 0.07)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
