import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SPECIES_OFFLINE_LABELS } from '../constants';

/** HU-21: ocupa el lugar de una foto que no está en el dispositivo y no se puede cargar sin conexión. */
export function PhotoUnavailable({
  style,
  compact = false,
}: {
  style?: StyleProp<ViewStyle>;
  /** Solo el ícono (p. ej. en la miniatura de la tarjeta, que ya lleva la etiqueta). */
  compact?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundSelected }, style]}
      accessible
      accessibilityLabel={SPECIES_OFFLINE_LABELS.photoUnavailable}>
      <Icon name="offline" size={compact ? 40 : 32} color="textMuted" />
      {!compact && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
          {SPECIES_OFFLINE_LABELS.photoUnavailable}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  text: {
    textAlign: 'center',
  },
});
