import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { MAP_LABELS } from '../constants';
import { type TrailStation } from '../types';

type StationDetailsCardProps = {
  station: TrailStation;
  onClose: () => void;
  onSpeciesPress: (speciesId: string) => void;
};

/** Ficha breve de estación sobre el mapa con acceso a las fichas taxonómicas asociadas. */
export function StationDetailsCard({ station, onClose, onSpeciesPress }: StationDetailsCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.heading}>
        <ThemedText type="smallBold" themeColor="textLabel" accessibilityRole="header">
          {station.name}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={MAP_LABELS.closeDetails}
          onPress={onClose}
          style={styles.closeButton}>
          <Icon name="close" size={20} color="textSecondary" />
        </Pressable>
      </View>
      {station.photoUrl ? (
        <Image source={{ uri: station.photoUrl }} contentFit="cover" style={styles.photo} />
      ) : (
        <View style={[styles.photoPlaceholder, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="caption" themeColor="textSecondary">
            {MAP_LABELS.noStationPhoto}
          </ThemedText>
        </View>
      )}
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
        {station.description || MAP_LABELS.noStationDescription}
      </ThemedText>
      <ThemedText type="captionBold" themeColor="textLabel">
        {MAP_LABELS.associatedSpecies}
      </ThemedText>
      {station.species.length === 0 ? (
        <ThemedText type="caption" themeColor="textMuted">
          {MAP_LABELS.noAssociatedSpecies}
        </ThemedText>
      ) : (
        <FlatList
          horizontal
          data={station.species}
          keyExtractor={(species) => species.id}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.speciesSeparator} />}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={MAP_LABELS.species(item.commonName)}
              onPress={() => onSpeciesPress(item.id)}
              style={({ pressed }) => [
                styles.speciesButton,
                { backgroundColor: theme.primarySoft },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="captionBold" themeColor="textLabel">
                {item.commonName}
              </ThemedText>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.three,
    maxHeight: '60%',
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
    elevation: 5,
  },
  heading: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  closeButton: {
    width: MinTouchSize,
    height: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: 120,
    borderRadius: Radius.medium,
  },
  photoPlaceholder: {
    width: '100%',
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium,
  },
  speciesButton: {
    minHeight: MinTouchSize,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  speciesSeparator: {
    width: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
});
