import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { FontFamily, MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ChipButtonProps = {
  label: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
};

/** Chip de filtro: verde de marca cuando está activo (Figma: "Todos"), neutro-100 cuando no. */
export function ChipButton({ label, icon, selected, onPress }: ChipButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? theme.primary : theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={18} color={selected ? 'onPrimary' : 'textSecondary'} />
      <ThemedText
        style={[styles.label, { color: selected ? theme.onPrimary : theme.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: MinTouchSize - Spacing.two,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
