import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export type FormScreenProps = {
  children: ReactNode;
  /** `true` si la pantalla muestra el encabezado del navegador (ya cubre el área segura superior). */
  hasNavigationHeader?: boolean;
};

const EDGES_WITH_HEADER: Edge[] = ['bottom', 'left', 'right'];
const ALL_EDGES: Edge[] = ['top', 'bottom', 'left', 'right'];

/** Contenedor de pantallas de formulario: área segura, scroll y manejo del teclado. */
export function FormScreen({ children, hasNavigationHeader = false }: FormScreenProps) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={hasNavigationHeader ? EDGES_WITH_HEADER : ALL_EDGES}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 28,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
