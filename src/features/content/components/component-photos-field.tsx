import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_MESSAGES, WETLAND_COMPONENT_LIMITS, WETLAND_LABELS } from '../constants';
import { type NewComponentPhoto, type WetlandComponentPhoto } from '../types';

const TILE_SIZE = 96;

export type ComponentPhotosFieldProps = {
  /** Fotos que ya tiene el componente en el servidor (solo al editar). */
  savedPhotos?: WetlandComponentPhoto[];
  /** Fotos elegidas en el teléfono que se subirán al guardar. */
  newPhotos: NewComponentPhoto[];
  onAdd: () => void;
  onRemoveSaved?: (photoId: string) => void;
  onRemoveNew: (photo: NewComponentPhoto) => void;
};

/**
 * Fotos de un componente del humedal (HU-15 y HU-25): miniaturas con botón para quitar, contador
 * "x de 10" y botón para agregar mientras no se llegue al máximo.
 */
export function ComponentPhotosField({
  savedPhotos = [],
  newPhotos,
  onAdd,
  onRemoveSaved,
  onRemoveNew,
}: ComponentPhotosFieldProps) {
  const photoCount = savedPhotos.length + newPhotos.length;
  const isFull = photoCount >= WETLAND_COMPONENT_LIMITS.maxPhotos;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="label" themeColor="textLabel">
          {WETLAND_LABELS.photosSection}
        </ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          {WETLAND_LABELS.photosCounter(photoCount, WETLAND_COMPONENT_LIMITS.maxPhotos)}
        </ThemedText>
      </View>
      <ThemedText type="caption" themeColor="textMuted">
        {WETLAND_LABELS.photosHint}
      </ThemedText>
      <View style={styles.grid}>
        {savedPhotos.map((photo) => (
          <PhotoTile key={photo.id} uri={photo.url} onRemove={() => onRemoveSaved?.(photo.id)} />
        ))}
        {newPhotos.map((photo) => (
          <PhotoTile key={photo.uri} uri={photo.uri} isNew onRemove={() => onRemoveNew(photo)} />
        ))}
        {!isFull && <AddPhotoTile onPress={onAdd} />}
      </View>
      {isFull && (
        <ThemedText type="caption" themeColor="textSecondary">
          {CONTENT_MESSAGES.photoLimitReached}
        </ThemedText>
      )}
    </View>
  );
}

function PhotoTile({
  uri,
  isNew = false,
  onRemove,
}: {
  uri: string;
  isNew?: boolean;
  onRemove: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: theme.backgroundSelected }]}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      {isNew && (
        <View style={[styles.newBadge, { backgroundColor: theme.primary }]}>
          <ThemedText type="captionBold" themeColor="onPrimary">
            {WETLAND_LABELS.newPhotoBadge}
          </ThemedText>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={WETLAND_LABELS.removePhoto}
        onPress={onRemove}
        hitSlop={Spacing.one}
        style={styles.removeButton}>
        <Icon name="close" size={14} color="onPrimary" />
      </Pressable>
    </View>
  );
}

function AddPhotoTile({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={WETLAND_LABELS.addPhoto}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        styles.addTile,
        { borderColor: theme.primary, backgroundColor: theme.primarySoft },
        pressed && styles.pressed,
      ]}>
      <Icon name="imagePlus" size={24} color="primary" />
      <ThemedText type="captionBold" themeColor="primary" style={styles.addLabel}>
        {WETLAND_LABELS.addPhoto}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addLabel: {
    fontFamily: FontFamily.bold,
    textAlign: 'center',
  },
  newBadge: {
    position: 'absolute',
    left: Spacing.one,
    bottom: Spacing.one,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 15, 10, 0.6)',
  },
  pressed: {
    opacity: 0.7,
  },
});
