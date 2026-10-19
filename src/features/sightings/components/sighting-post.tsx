import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { type Sighting } from '../types';
import { FeedPhoto } from './feed-photo';
import { formatSightingDate } from './format-sighting';
import { SightingAuthor } from './sighting-author';
import { SightingDetails } from './sighting-details';

export type SightingPostProps = {
  sighting: Sighting;
};

/**
 * Publicación del foro (HU-20 CA1): autor y fecha, foto de borde a borde (si tiene), reino y
 * clasificación, descripción y lugar. A diferencia del Figma no va en tarjeta: la foto ocupa todo el
 * ancho, como en Instagram. Sin "me gusta" ni comentarios: no están en las HU ni en la API.
 */
export function SightingPost({ sighting }: SightingPostProps) {
  return (
    <View style={styles.post}>
      <View style={styles.padded}>
        <SightingAuthor name={sighting.author} subtitle={formatSightingDate(sighting.createdAt)} />
      </View>
      {sighting.photoUrl && <FeedPhoto uri={sighting.photoUrl} />}
      <View style={styles.padded}>
        <SightingDetails
          remarks={sighting.remarks}
          kingdom={sighting.kingdom}
          vernacularName={sighting.vernacularName}
          location={sighting.location}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  post: {
    gap: 12,
    paddingVertical: Spacing.three,
  },
  padded: {
    paddingHorizontal: Spacing.three,
  },
});
