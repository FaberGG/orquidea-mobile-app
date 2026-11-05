import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { type MapType } from 'react-native-maps';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { MAP_LABELS } from '../constants';
import { type TrailStation } from '../types';

type NearestStation = { station: TrailStation; distanceMeters: number } | null;

type MapControlsProps = {
  mapType: MapType;
  isLocating: boolean;
  nearest: NearestStation;
  onMapTypeChange: (mapType: MapType) => void;
  onLocate: () => void;
};

/** Controles flotantes para cambiar la capa del mapa y centrar la ubicación actual. */
export function MapControls({
  mapType,
  isLocating,
  nearest,
  onMapTypeChange,
  onLocate,
}: MapControlsProps) {
  const theme = useTheme();
  const nextMapType = mapType === 'satellite' ? 'standard' : 'satellite';
  const nextMapTypeLabel = mapType === 'satellite' ? MAP_LABELS.standard : MAP_LABELS.satellite;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={nextMapTypeLabel}
        accessibilityState={{ selected: mapType === 'satellite' }}
        onPress={() => onMapTypeChange(nextMapType)}
        style={({ pressed }) => [
          styles.layerButton,
          { backgroundColor: theme.background, borderColor: theme.border },
          pressed && styles.pressed,
        ]}>
        <ThemedText type="smallBold" themeColor="textLabel">
          {nextMapTypeLabel}
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={MAP_LABELS.currentLocation}
        accessibilityState={{ busy: isLocating }}
        disabled={isLocating}
        onPress={onLocate}
        style={({ pressed }) => [
          styles.locationButton,
          { backgroundColor: theme.background, borderColor: theme.border },
          pressed && styles.pressed,
        ]}>
        {isLocating ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <Icon name="locate" size={20} color="primary" />
        )}
        <ThemedText type="smallBold" themeColor="textLabel">
          {MAP_LABELS.currentLocation}
        </ThemedText>
      </Pressable>
      {nearest !== null && (
        <View style={[styles.nearest, { backgroundColor: theme.background }]}>
          <ThemedText type="captionBold" themeColor="textLabel">
            {`${MAP_LABELS.nearestStation}: ${nearest.station.name} · ${MAP_LABELS.distance(nearest.distanceMeters)}`}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  layerButton: {
    minHeight: MinTouchSize,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    elevation: 2,
  },
  locationButton: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    elevation: 2,
  },
  nearest: {
    minHeight: MinTouchSize,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    elevation: 2,
  },
  pressed: {
    opacity: 0.75,
  },
});
