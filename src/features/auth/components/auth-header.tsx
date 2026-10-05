import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type AuthHeaderProps = {
  title: string;
  subtitle: ReactNode;
};

/** Título y subtítulo centrados de las pantallas de acceso (diseño HE-1). */
export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.header}>
      <ThemedText type="subtitle" accessibilityRole="header" style={styles.centered}>
        {title}
      </ThemedText>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={[styles.centered, styles.subtitle]}>
        {subtitle}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 14,
    padding: 10,
  },
  centered: {
    textAlign: 'center',
  },
  subtitle: {
    // Ancho del subtítulo en el diseño (224 px): fuerza el corte en dos líneas.
    maxWidth: 224,
  },
});
