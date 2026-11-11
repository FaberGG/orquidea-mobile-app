import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { LOCATION_PICKER_LABELS, MapLocationPicker } from '@/features/map';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useTheme } from '@/hooks/use-theme';
import { getCurrentLocation } from '@/lib/location';

import { SIGHTING_FORM_LABELS, SIGHTINGS_MESSAGES } from '../constants';
import { type Coordinates } from '../types';
import { formatCoordinates } from './format-sighting';

export type SightingLocationFieldProps = {
  value: Coordinates | null;
  onChange: (value: Coordinates | null) => void;
};

/**
 * Lugar del avistamiento (Figma: "ubicacion"). La API guarda coordenadas. Se toma la ubicación actual
 * del teléfono o, con conexión, se elige tocando el mapa (SCRUM-72); sin red solo queda el GPS. Es
 * opcional.
 */
export function SightingLocationField({ value, onChange }: SightingLocationFieldProps) {
  const theme = useTheme();
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPickingOnMap, setIsPickingOnMap] = useState(false);
  const { status: networkStatus } = useNetworkStatus();

  const locate = async () => {
    setIsLocating(true);
    setError(null);
    const result = await getCurrentLocation();
    setIsLocating(false);
    if (result.status === 'located') onChange(result.coordinates);
    if (result.status === 'denied') setError(SIGHTINGS_MESSAGES.locationDenied);
    if (result.status === 'error') setError(SIGHTINGS_MESSAGES.locationError);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="label" themeColor="textLabel">
        {SIGHTING_FORM_LABELS.locationLabel}
      </ThemedText>

      {value ? (
        <View
          style={[
            styles.field,
            { borderColor: theme.primary, backgroundColor: theme.primarySoft },
          ]}>
          <Icon name="location" size={20} color="primary" />
          <ThemedText type="smallSemiBold" themeColor="primary" style={styles.flex}>
            {formatCoordinates(value)}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={SIGHTING_FORM_LABELS.removeLocation}
            onPress={() => onChange(null)}
            hitSlop={Spacing.three}>
            <Icon name="close" size={20} color="primary" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={SIGHTING_FORM_LABELS.useCurrentLocation}
          accessibilityState={{ busy: isLocating, disabled: isLocating }}
          disabled={isLocating}
          onPress={() => void locate()}
          style={({ pressed }) => [
            styles.field,
            { borderColor: theme.border, backgroundColor: theme.background },
            pressed && styles.pressed,
          ]}>
          {isLocating ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Icon name="locate" size={20} color="primary" />
          )}
          <ThemedText type="small" themeColor={isLocating ? 'textMuted' : 'primary'}>
            {isLocating ? SIGHTING_FORM_LABELS.locating : SIGHTING_FORM_LABELS.useCurrentLocation}
          </ThemedText>
        </Pressable>
      )}

      {networkStatus !== 'offline' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={value ? LOCATION_PICKER_LABELS.change : LOCATION_PICKER_LABELS.open}
          onPress={() => setIsPickingOnMap(true)}
          style={({ pressed }) => [
            styles.field,
            { borderColor: theme.border, backgroundColor: theme.background },
            pressed && styles.pressed,
          ]}>
          <Icon name="map" size={20} color="primary" />
          <ThemedText type="small" themeColor="primary">
            {value ? LOCATION_PICKER_LABELS.change : LOCATION_PICKER_LABELS.open}
          </ThemedText>
        </Pressable>
      )}
      <MapLocationPicker
        visible={isPickingOnMap}
        value={value}
        onCancel={() => setIsPickingOnMap(false)}
        onConfirm={(point) => {
          setIsPickingOnMap(false);
          setError(null);
          onChange(point);
        }}
      />

      {error && (
        <ThemedText type="caption" themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: MinTouchSize + Spacing.one,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
