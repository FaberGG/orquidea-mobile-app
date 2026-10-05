import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
  /** Acción opcional bajo el texto (p. ej. un botón para iniciar sesión). */
  children?: ReactNode;
};

/** Estado vacío centrado: ícono en un círculo de marca, título y descripción. */
export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
        <Icon name={icon} size={32} color="primary" />
      </View>
      <ThemedText style={styles.title} themeColor="textLabel" accessibilityRole="header">
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
        {description}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    lineHeight: 23,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
  },
});
