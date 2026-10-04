import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'link';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
};

/** Botón base. `primary` para la acción principal de una pantalla; `link` para acciones secundarias. */
export function Button({
  label,
  variant = 'primary',
  isLoading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = Boolean(disabled) || isLoading;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole={isPrimary ? 'button' : 'link'}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary && [styles.primary, { backgroundColor: theme.primary }],
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      {...rest}>
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? theme.onPrimary : theme.primary} />
      ) : (
        <ThemedText
          type={isPrimary ? 'default' : 'small'}
          style={[
            isPrimary && styles.primaryLabel,
            { color: isPrimary ? theme.onPrimary : theme.primary },
          ]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    borderRadius: Radius.pill,
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
  },
  primaryLabel: {
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    // El diseño usa interlineado 1 (16 px): el botón mide 44 px con el padding de 14.
    lineHeight: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});
