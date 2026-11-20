import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type UnderlineTab<T extends string> = { id: T; label: string };

export type UnderlineTabsProps<T extends string> = {
  tabs: readonly UnderlineTab<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Pestañas con texto e indicador inferior (Figma: "admin-tabs"). Las usan Comunidad | Moderación y
 * Visibles | Ocultos de los anuncios.
 */
export function UnderlineTabs<T extends string>({ tabs, value, onChange }: UnderlineTabsProps<T>) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const isSelected = tab.id === value;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(tab.id)}
            style={styles.tab}>
            <ThemedText
              style={[styles.label, isSelected && styles.labelSelected]}
              themeColor={isSelected ? 'primary' : 'textMuted'}>
              {tab.label}
            </ThemedText>
            <View style={[styles.indicator, isSelected && { backgroundColor: theme.primary }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  tab: {
    minHeight: MinTouchSize,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  labelSelected: {
    fontFamily: FontFamily.bold,
  },
  indicator: {
    height: 3,
    width: 80,
    borderRadius: 2,
  },
});
