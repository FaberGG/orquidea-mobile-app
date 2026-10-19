import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SIGHTING_FORM_LABELS } from '../constants';

export type SightingPhotoFieldProps = {
  photoUri: string | null;
  onPick: () => void;
  onRemove: () => void;
};

/**
 * Foto opcional del reporte (Figma: "foto"). La API acepta **una** foto por reporte, así que no hay
 * carrusel como en el diseño (ver docs/sprints/he-07-pendientes.md).
 */
export function SightingPhotoField({ photoUri, onPick, onRemove }: SightingPhotoFieldProps) {
  const theme = useTheme();

  if (photoUri) {
    return (
      <View style={[styles.photo, { backgroundColor: theme.backgroundSelected }]}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.photoActions}>
          <PhotoAction icon="camera" label={SIGHTING_FORM_LABELS.photoChange} onPress={onPick} />
          <PhotoAction icon="close" label={SIGHTING_FORM_LABELS.photoRemove} onPress={onRemove} />
        </View>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={SIGHTING_FORM_LABELS.photoUpload}
      onPress={onPick}
      style={({ pressed }) => [
        styles.empty,
        { borderColor: theme.primarySoft, backgroundColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
        <Icon name="imagePlus" size={28} color="primary" />
      </View>
      <View style={styles.texts}>
        <ThemedText type="smallBold" themeColor="primary">
          {SIGHTING_FORM_LABELS.photoUpload}
        </ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          {SIGHTING_FORM_LABELS.photoHint}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function PhotoAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={Spacing.one}
      style={styles.photoAction}>
      <Icon name={icon} size={16} color="onPrimary" />
      <ThemedText type="captionBold" themeColor="onPrimary">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photo: {
    height: 220,
    borderRadius: Radius.medium + Spacing.one,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
  },
  photoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: 12,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    // Velo oscuro fijo: el texto blanco debe leerse sobre cualquier foto, en ambos temas.
    backgroundColor: 'rgba(0, 15, 10, 0.6)',
  },
  empty: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.medium + Spacing.one,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.8,
  },
});
