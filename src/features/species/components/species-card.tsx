import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { OfflineImage } from '@/components/ui/offline-image';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useConnectivity } from '@/hooks/use-connectivity';
import { useTheme } from '@/hooks/use-theme';

import { SPECIES_CATEGORY_LABELS, SPECIES_OFFLINE_LABELS } from '../constants';
import { useSpeciesOfflineState } from '../hooks';
import { type Species } from '../types';
import { ConservationBadge, ConservationChip } from './conservation';
import { PhotoUnavailable } from './photo-unavailable';

/** Foto cuadrada (1:1); la imagen se recorta para llenarla, sin estirarse. */
const PHOTO_ASPECT_RATIO = 1;

export type SpeciesCardProps = {
  species: Species;
  onPress: (species: Species) => void;
};

/**
 * Tarjeta del listado (Figma: "card-…"): foto, nombre común, código UICN, nombre científico y chips.
 * HU-21: sin conexión, si la ficha no tiene todas sus fotos en el dispositivo lo indica con una etiqueta.
 */
export function SpeciesCard({ species, onPress }: SpeciesCardProps) {
  const theme = useTheme();
  const connectivity = useConnectivity();
  const offlineState = useSpeciesOfflineState(species);
  const photosUnavailable = connectivity === 'offline' && offlineState === 'missing-photos';
  // Miniatura de la API para el listado; las copias offline antiguas no la tienen.
  const thumbnailUrl = species.thumbnailUrl ?? species.photoUrl;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        photosUnavailable
          ? `${species.vernacularName}. ${SPECIES_OFFLINE_LABELS.photosUnavailable}`
          : species.vernacularName
      }
      onPress={() => onPress(species)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background, shadowColor: theme.text },
        pressed && styles.pressed,
      ]}>
      {thumbnailUrl ? (
        <OfflineImage
          uri={thumbnailUrl}
          style={styles.photo}
          contentFit="cover"
          unavailableFallback={<PhotoUnavailable compact style={styles.photo} />}
        />
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
        {photosUnavailable && (
          <View style={styles.offlineNote}>
            <Icon name="offline" size={16} color="textMuted" />
            <ThemedText type="caption" themeColor="textSecondary">
              {SPECIES_OFFLINE_LABELS.photosUnavailable}
            </ThemedText>
          </View>
        )}
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
    aspectRatio: PHOTO_ASPECT_RATIO,
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
  offlineNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
  },
});
