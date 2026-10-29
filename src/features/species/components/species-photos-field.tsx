import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SPECIES_FORM_LABELS } from '../constants';
import { SPECIES_PHOTO_LIMIT, type SpeciesPhoto } from '../schemas/species-form.schema';
import { type SpeciesPhotoItem } from '../types';

const TILE_SIZE = 96;

export type SpeciesPhotosFieldProps = {
  /** Fotos ya guardadas que se conservan (al editar). */
  savedPhotos: SpeciesPhotoItem[];
  /** Fotos elegidas que aún no se suben. */
  newPhotos: SpeciesPhoto[];
  onAdd: () => void;
  onRemoveSaved: (photoId: string) => void;
  onRemoveNew: (uri: string) => void;
};

type Tile = { key: string; uri: string; onRemove: (() => void) | null };

/**
 * Fotos de la ficha (HU-7 v2.0): una o más, hasta `SPECIES_PHOTO_LIMIT`. La primera es la principal del
 * listado. No se puede quitar la última foto (la ficha siempre tiene una) ni una guardada sin `id`, porque
 * la API anterior a v2.0 no permite quitarla por separado.
 */
export function SpeciesPhotosField({
  savedPhotos,
  newPhotos,
  onAdd,
  onRemoveSaved,
  onRemoveNew,
}: SpeciesPhotosFieldProps) {
  const theme = useTheme();
  const total = savedPhotos.length + newPhotos.length;

  if (total === 0) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={SPECIES_FORM_LABELS.photoUpload}
        onPress={onAdd}
        style={[
          styles.empty,
          { borderColor: theme.border, backgroundColor: theme.backgroundElement },
        ]}>
        <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
          <Icon name="imagePlus" size={24} color="primary" />
        </View>
        <ThemedText type="smallBold" themeColor="primary">
          {SPECIES_FORM_LABELS.photoUpload}
        </ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          {SPECIES_FORM_LABELS.photoHint}
        </ThemedText>
      </Pressable>
    );
  }

  const canRemove = total > 1;
  const tiles: Tile[] = [
    ...savedPhotos.map((photo) => {
      const { id } = photo;
      return {
        key: id ?? photo.url,
        uri: photo.url,
        onRemove: canRemove && id !== null ? () => onRemoveSaved(id) : null,
      };
    }),
    ...newPhotos.map((photo) => ({
      key: photo.uri,
      uri: photo.uri,
      onRemove: canRemove ? () => onRemoveNew(photo.uri) : null,
    })),
  ];

  return (
    <View style={styles.field}>
      <View style={styles.header}>
        <ThemedText type="caption" themeColor="textMuted" style={styles.hint}>
          {SPECIES_FORM_LABELS.photosOrderHint}
        </ThemedText>
        <ThemedText type="captionBold" themeColor="textSecondary">
          {SPECIES_FORM_LABELS.photosCounter(total, SPECIES_PHOTO_LIMIT)}
        </ThemedText>
      </View>
      <View style={styles.grid}>
        {tiles.map((tile, index) => (
          <View
            key={tile.key}
            style={[styles.tile, { backgroundColor: theme.backgroundSelected }]}
            accessibilityLabel={SPECIES_FORM_LABELS.photoNumber(index + 1)}>
            <Image source={{ uri: tile.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
            {index === 0 && (
              <View style={[styles.principal, { backgroundColor: theme.primary }]}>
                <ThemedText type="captionBold" themeColor="onPrimary">
                  {SPECIES_FORM_LABELS.photoPrincipal}
                </ThemedText>
              </View>
            )}
            {tile.onRemove && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={SPECIES_FORM_LABELS.photoRemove(index + 1)}
                onPress={tile.onRemove}
                hitSlop={Spacing.one}
                style={styles.remove}>
                <Icon name="close" size={14} fixedColor="#FFFFFF" />
              </Pressable>
            )}
          </View>
        ))}
        {total < SPECIES_PHOTO_LIMIT && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={SPECIES_FORM_LABELS.photoAdd}
            onPress={onAdd}
            style={[
              styles.tile,
              styles.add,
              { borderColor: theme.border, backgroundColor: theme.backgroundElement },
            ]}>
            <Icon name="imagePlus" size={22} color="primary" />
            <ThemedText type="captionBold" themeColor="primary">
              {SPECIES_FORM_LABELS.photoAdd}
            </ThemedText>
          </Pressable>
        )}
      </View>
      <ThemedText type="caption" themeColor="textMuted">
        {SPECIES_FORM_LABELS.photoHint}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  hint: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  principal: {
    position: 'absolute',
    left: Spacing.one,
    bottom: Spacing.one,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.one,
  },
  remove: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 15, 10, 0.6)',
  },
  empty: {
    height: 160,
    borderRadius: Radius.medium + Spacing.one,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
});
