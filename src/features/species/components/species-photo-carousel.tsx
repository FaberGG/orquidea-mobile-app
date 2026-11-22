import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { OfflineImage } from '@/components/ui/offline-image';
import { Radius, Spacing } from '@/constants/theme';
import { useConnectivity } from '@/hooks/use-connectivity';
import { useLocalOfflineFileUri } from '@/hooks/use-offline-file-uri';
import { useTheme } from '@/hooks/use-theme';

import { SPECIES_LABELS } from '../constants';
import { PhotoUnavailable } from './photo-unavailable';
import { useSpeciesPager } from './species-pager-context';
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
  const pager = useSpeciesPager();

  if (photos.length === 0) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundSelected }]} />
    );
  }

  return (
    <View
      style={StyleSheet.absoluteFill}
      // Sobre la foto no se cambia de ficha: el dedo sobre ella solo mueve las fotos.
      onTouchStart={() => pager?.setSwipeEnabled(false)}
      onTouchEnd={() => pager?.setSwipeEnabled(true)}
      onTouchCancel={() => pager?.setSwipeEnabled(true)}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={photos.length > 1}
        // Respaldo: si el sistema se queda con el gesto y no avisa del fin del toque, el paginador se reactiva aquí.
        onScrollEndDrag={() => pager?.setSwipeEnabled(true)}
        onMomentumScrollEnd={(event) => {
          pager?.setSwipeEnabled(true);
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}>
        {photos.map((photo, position) => (
          <CarouselPhoto
            key={photo.id ?? photo.url}
            url={photo.url}
            label={SPECIES_LABELS.photoOf(name, position + 1, photos.length)}
            width={width}
            height={height}
            onPress={() =>
              router.push({
                pathname: '/sightings/photo',
                params: { uri: photo.url, uris: JSON.stringify(photos.map((item) => item.url)) },
              })
            }
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

/**
 * Una foto del carrusel. HU-21: si no está en el dispositivo y no hay conexión, muestra el aviso en su lugar
 * y no abre el visor (no habría nada que ampliar).
 */
function CarouselPhoto({
  url,
  label,
  width,
  height,
  onPress,
}: {
  url: string;
  label: string;
  width: number;
  height: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const local = useLocalOfflineFileUri(url);
  const connectivity = useConnectivity();
  const unavailable = local === null && connectivity === 'offline';
  return (
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel={label}
      accessibilityHint={unavailable ? undefined : SPECIES_LABELS.photoZoomHint}
      disabled={unavailable}
      onPress={onPress}>
      <OfflineImage
        uri={url}
        style={{ width, height, backgroundColor: theme.backgroundSelected }}
        contentFit="cover"
        accessibilityIgnoresInvertColors
        unavailableFallback={<PhotoUnavailable style={{ width, height }} />}
      />
    </Pressable>
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
