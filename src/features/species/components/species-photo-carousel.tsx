import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { OfflineImage } from '@/components/ui/offline-image';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SPECIES_LABELS } from '../constants';
import { type SpeciesPhotoItem } from '../types';

export type SpeciesPhotoCarouselProps = {
  photos: SpeciesPhotoItem[];
  name: string;
  /** Alto del encabezado: la foto lo ocupa completo, recortada para llenarlo. */
  height: number;
};

/**
 * Fotos del encabezado del detalle (HU-7 v2.0): se pasan deslizando de lado y un contador indica la
 * posición. Ocupa todo el encabezado; sin fotos muestra el fondo neutro. Al tocar una foto se abre a
 * pantalla completa para ampliarla (visor compartido con los reportes).
 */
export function SpeciesPhotoCarousel({ photos, name, height }: SpeciesPhotoCarouselProps) {
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
          <Pressable
            key={photo.id ?? photo.url}
            accessibilityRole="imagebutton"
            accessibilityLabel={SPECIES_LABELS.photoOf(name, position + 1, photos.length)}
            accessibilityHint={SPECIES_LABELS.photoZoomHint}
            onPress={() =>
              router.push({ pathname: '/sightings/photo', params: { uri: photo.url } })
            }>
            <OfflineImage
              uri={photo.url}
              style={{ width, height, backgroundColor: theme.backgroundSelected }}
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
          </Pressable>
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
