import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SPECIES_CATEGORY_LABELS } from '../constants';
import { type Species } from '../types';
import { ConservationBadge, ConservationChip } from './conservation';

const PHOTO_HEIGHT = 320;

export type SpeciesCardProps = {
  species: Species;
  onPress: (species: Species) => void;
};

/** Tarjeta del listado (Figma: "card-…"): foto, nombre común, código UICN, nombre científico y chips. */
export function SpeciesCard({ species, onPress }: SpeciesCardProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={species.vernacularName}
      onPress={() => onPress(species)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background, shadowColor: theme.text },
        pressed && styles.pressed,
      ]}>
      {species.photoUrl ? (
        <Image source={{ uri: species.photoUrl }} style={styles.photo} contentFit="cover" />
      ) : (
        <View
          style={[styles.photo, styles.placeholder, { backgroundColor: theme.backgroundSelected }]}>
          <Icon name={species.category} size={48} color="textMuted" />
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.name} themeColor="textLabel" numberOfLines={1}>
            {species.vernacularName}
          </ThemedText>
          <ConservationBadge status={species.conservationStatus} />
        </View>
        <ThemedText style={styles.scientificName} themeColor="textMuted" numberOfLines={1}>
          {species.scientificName}
        </ThemedText>
        <View style={styles.chips}>
          <ConservationChip status={species.conservationStatus} />
          <View style={[styles.categoryChip, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="captionBold" themeColor="textSecondary">
              {SPECIES_CATEGORY_LABELS[species.category]}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  photo: {
    width: '100%',
    height: PHOTO_HEIGHT,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingTop: 14,
    paddingBottom: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 17,
    lineHeight: 23,
  },
  scientificName: {
    fontFamily: FontFamily.regular,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 18,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
  },
});
