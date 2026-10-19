import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'link';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
};

/**
 * Botón base. `primary` para la acción principal de una pantalla; `secondary` (con borde) para la
 * alternativa junto a ella (p. ej. Cancelar); `link` para acciones de texto.
 */
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
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole={variant === 'link' ? 'link' : 'button'}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary && [styles.pill, { backgroundColor: theme.primary }],
        isSecondary && [
          styles.pill,
          styles.secondary,
          { backgroundColor: theme.background, borderColor: theme.border },
        ],
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      {...rest}>
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? theme.onPrimary : theme.primary} />
      ) : (
        <ThemedText
          type={variant === 'link' ? 'small' : 'default'}
          style={[
            variant !== 'link' && styles.pillLabel,
            {
              color: isPrimary
                ? theme.onPrimary
                : isSecondary
                  ? theme.textSecondary
                  : theme.primary,
            },
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
  pill: {
    borderRadius: Radius.pill,
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
  },
  secondary: {
    borderWidth: 1,
  },
  pillLabel: {
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
