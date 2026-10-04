import { StyleSheet, View } from 'react-native';

import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

/**
 * Destino del enlace "¿Olvidaste tu contraseña?" (HU-1 CA4).
 * El flujo con código de 6 dígitos se implementa en HU-1.1 (rama feature/recuperar-contrasena).
 */
export function ForgotPasswordScreen() {
  return (
    <FormScreen hasNavigationHeader>
      <View style={styles.header}>
        <ThemedText type="subtitle" accessibilityRole="header">
          Recuperar contraseña
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Muy pronto podrás restablecer tu contraseña desde aquí.
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
