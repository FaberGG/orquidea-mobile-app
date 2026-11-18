import { Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Asterisco de campo obligatorio. Va dentro de la etiqueta (`<ThemedText>`), de la que hereda la fuente. */
export function RequiredMark() {
  const theme = useTheme();
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{ color: theme.danger }}>
      {' *'}
    </Text>
  );
}
