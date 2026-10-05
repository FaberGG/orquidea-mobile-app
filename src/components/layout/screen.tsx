import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth } from '@/constants/theme';

export type ScreenProps = {
  children: ReactNode;
};

/**
 * Contenedor base de las pantallas que viven bajo el encabezado y la barra de pestañas (ya cubren las
 * áreas seguras): fondo del tema y ancho máximo en tablet/web.
 */
export function Screen({ children }: ScreenProps) {
  return (
    <ThemedView style={styles.flex}>
      <View style={styles.content}>{children}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
