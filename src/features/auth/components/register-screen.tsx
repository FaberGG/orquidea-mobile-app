import { StyleSheet, View } from 'react-native';

import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

/**
 * Destino del enlace "Registrarse" del login. El formulario de registro se implementa en HU-2
 * (rama feature/registro).
 */
export function RegisterScreen() {
  return (
    <FormScreen hasNavigationHeader>
      <View style={styles.header}>
        <ThemedText type="subtitle" accessibilityRole="header">
          Registrarse
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Muy pronto podrás crear tu cuenta desde aquí.
        </ThemedText>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
});
