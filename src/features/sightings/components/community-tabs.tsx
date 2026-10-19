import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SIGHTINGS_LABELS } from '../constants';

export type CommunityView = 'feed' | 'moderation';

const TABS = [
  { id: 'feed', label: SIGHTINGS_LABELS.tabFeed },
  { id: 'moderation', label: SIGHTINGS_LABELS.tabModeration },
] as const satisfies readonly { id: CommunityView; label: string }[];

export type CommunityTabsProps = {
  value: CommunityView;
  onChange: (value: CommunityView) => void;
};

/**
 * Pestañas "Comunidad | Moderación" (Figma: "admin-tabs"). Solo las ve quien puede revisar reportes;
 * el resto de roles ve directamente el foro.
 */
export function CommunityTabs({ value, onChange }: CommunityTabsProps) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {TABS.map((tab) => {
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
