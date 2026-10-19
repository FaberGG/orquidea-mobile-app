import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Spacing } from '@/constants/theme';

import { WETLAND_LABELS } from '../constants';

/** Encabezado de las pantallas de HE-06: botón para volver y título centrado. */
export function ContentScreenHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={WETLAND_LABELS.back}
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
      <View style={styles.side} />
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
