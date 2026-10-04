import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type FormMessageProps = {
  message: string;
};

/**
 * Mensaje de error de un formulario (textos de los criterios de aceptación).
 * Se anuncia a los lectores de pantalla al aparecer.
 */
export function FormMessage({ message }: FormMessageProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.container, { backgroundColor: theme.dangerBackground }]}>
      <ThemedText type="small" style={{ color: theme.danger }}>
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
