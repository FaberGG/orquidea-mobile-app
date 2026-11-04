import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SPECIES_LABELS } from '../constants';
import { type SpeciesPhotoItem } from '../types';

export type SpeciesPhotoCarouselProps = {
  photos: SpeciesPhotoItem[];
  name: string;
};

/**
 * Fotos del encabezado del detalle (HU-7 v2.0): se pasan deslizando de lado y un contador indica la
 * posición. Ocupa todo el encabezado; sin fotos muestra el fondo neutro.
 */
export function SpeciesPhotoCarousel({ photos, name }: SpeciesPhotoCarouselProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundSelected }]} />
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={photos.length > 1}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }>
        {photos.map((photo, position) => (
          <Image
            key={photo.id ?? photo.url}
            source={{ uri: photo.url }}
            style={[styles.photo, { width, backgroundColor: theme.backgroundSelected }]}
            contentFit="cover"
            accessibilityLabel={SPECIES_LABELS.photoOf(name, position + 1, photos.length)}
          />
        ))}
      </ScrollView>
      {photos.length > 1 && (
        <View style={styles.counter} pointerEvents="none">
          <ThemedText type="captionBold" style={styles.counterText}>
            {`${index + 1}/${photos.length}`}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    height: '100%',
  },
  counter: {
    position: 'absolute',
    top: Spacing.six,
    right: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0, 15, 10, 0.55)',
  },
  counterText: {
    color: '#FFFFFF',
  },
});
