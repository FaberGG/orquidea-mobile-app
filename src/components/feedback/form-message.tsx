import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type FormMessageProps = {
  message: string;
  /** `error` (por defecto) para validaciones y fallos; `success` para confirmaciones. */
  variant?: 'error' | 'success';
};

/**
 * Mensaje debajo de un formulario (textos de los criterios de aceptación).
 * Se anuncia a los lectores de pantalla al aparecer.
 */
export function FormMessage({ message, variant = 'error' }: FormMessageProps) {
  const theme = useTheme();
  const isError = variant === 'error';

  return (
    <View
      accessibilityRole={isError ? 'alert' : 'summary'}
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        { backgroundColor: isError ? theme.dangerBackground : theme.successBackground },
      ]}>
      <ThemedText type="small" style={{ color: isError ? theme.danger : theme.success }}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
