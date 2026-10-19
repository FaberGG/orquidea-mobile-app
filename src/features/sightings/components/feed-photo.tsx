import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { FEED_PHOTO_ASPECT, SIGHTINGS_LABELS } from '../constants';
import { clampAspectRatio } from './format-sighting';

export type FeedPhotoProps = {
  uri: string;
};

/**
 * Foto de una publicación del foro, de borde a borde de la pantalla (como Instagram). Respeta la
 * proporción de la foto dentro de 4:5 y 1.91:1; las más altas o más anchas se recortan al centro. Al
 * tocarla se abre completa en el visor con zoom.
 */
export function FeedPhoto({ uri }: FeedPhotoProps) {
  const theme = useTheme();
  const [aspectRatio, setAspectRatio] = useState<number>(FEED_PHOTO_ASPECT.initial);

  return (
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel={SIGHTINGS_LABELS.openPhoto}
      onPress={() => router.push({ pathname: '/sightings/photo', params: { uri } })}>
      <Image
        source={{ uri }}
        style={[styles.photo, { aspectRatio, backgroundColor: theme.backgroundSelected }]}
        contentFit="cover"
        transition={150}
        onLoad={({ source }) =>
          setAspectRatio(
            clampAspectRatio(
              source.width,
              source.height,
              FEED_PHOTO_ASPECT.min,
              FEED_PHOTO_ASPECT.max,
            ),
          )
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
  },
});
