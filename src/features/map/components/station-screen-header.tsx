import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Spacing } from '@/constants/theme';

import { STATION_LABELS } from '../constants';

export type StationScreenHeaderProps = {
  title: string;
  /** Acción a la derecha (p. ej. crear estación con su permiso). */
  right?: ReactNode;
};

/** Encabezado de las pantallas de estaciones: volver, título centrado y una acción opcional. */
export function StationScreenHeader({ title, right }: StationScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={STATION_LABELS.back}
        onPress={() => router.back()}
        hitSlop={Spacing.two}
        style={styles.side}>
        <Icon name="chevronLeft" size={22} color="textLabel" />
      </Pressable>
      <ThemedText
        style={styles.title}
        themeColor="textLabel"
        accessibilityRole="header"
        numberOfLines={1}>
        {title}
      </ThemedText>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  side: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
  },
});
