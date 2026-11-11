import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { LOCATION_PICKER_LABELS, WETLAND_CENTER } from '../constants';
import { useTrailMap } from '../hooks/use-trail-map';
import { type Coordinates, type TrailMap } from '../types';
import { getInitialMapRegion, getLocationMapRegion } from '../utils/map-region';

export type MapLocationPickerProps = {
  visible: boolean;
  /** Punto ya elegido (se centra ahí y se puede mover). */
  value: Coordinates | null;
  onConfirm: (coordinates: Coordinates) => void;
  onCancel: () => void;
};

/** Región inicial: el punto elegido; si no hay, el sendero; si tampoco carga, el humedal. */
export function getPickerInitialRegion(value: Coordinates | null, map?: TrailMap): Region {
  if (value) return getLocationMapRegion(value);
  if (map && (map.bounds || map.segments.length > 0 || map.stations.length > 0)) {
    return getInitialMapRegion(map);
  }
  return getLocationMapRegion(WETLAND_CENTER);
}

/**
 * SCRUM-72: elegir un punto tocando el mapa. Se abre en pantalla completa; tocar el mapa pone el
 * marcador ahí y también se puede arrastrar. CONFIRMAR UBICACIÓN devuelve las coordenadas. Muestra el
 * sendero y sus estaciones como referencia si ya se cargaron. Solo se ofrece con conexión: quien lo
 * abre decide con `useNetworkStatus` (sin red, el mapa no carga sus mosaicos).
 */
export function MapLocationPicker({ visible, value, onConfirm, onCancel }: MapLocationPickerProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      {visible && <PickerContent value={value} onConfirm={onConfirm} onCancel={onCancel} />}
    </Modal>
  );
}

function PickerContent({ value, onConfirm, onCancel }: Omit<MapLocationPickerProps, 'visible'>) {
  const theme = useTheme();
  const { data: map } = useTrailMap();
  const [point, setPoint] = useState<Coordinates | null>(value);
  // La región se calcula una vez: si el sendero llega después, no se mueve el mapa bajo el dedo.
  const [initialRegion] = useState(() => getPickerInitialRegion(value, map));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ThemedText type="subtitle" accessibilityRole="header">
          {LOCATION_PICKER_LABELS.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {LOCATION_PICKER_LABELS.hint}
        </ThemedText>
      </View>

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={(event) => setPoint(event.nativeEvent.coordinate)}
        toolbarEnabled={false}
        accessibilityLabel={LOCATION_PICKER_LABELS.mapLabel}>
        {map?.segments.map((segment) => (
          <Polyline
            key={segment.id}
            coordinates={segment.coordinates}
            strokeColor={theme.primary}
            strokeWidth={4}
          />
        ))}
        {map?.stations.map((station) => (
          <Marker
            key={station.id}
            coordinate={station.coordinates}
            title={station.name}
            pinColor={theme.primary}
            opacity={0.6}
          />
        ))}
        {point && (
          <Marker
            coordinate={point}
            draggable
            onDragEnd={(event) => setPoint(event.nativeEvent.coordinate)}
            pinColor={theme.danger}
            accessibilityLabel={LOCATION_PICKER_LABELS.selectedPoint}
          />
        )}
      </MapView>

      <View style={styles.footer}>
        <ThemedText
          type="smallSemiBold"
          themeColor={point ? 'text' : 'textMuted'}
          accessibilityLiveRegion="polite">
          {point ? LOCATION_PICKER_LABELS.coordinates(point) : LOCATION_PICKER_LABELS.noPoint}
        </ThemedText>
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button label={LOCATION_PICKER_LABELS.cancel} variant="secondary" onPress={onCancel} />
          </View>
          <View style={styles.action}>
            <Button
              label={LOCATION_PICKER_LABELS.confirm}
              disabled={point === null}
              onPress={() => point && onConfirm(point)}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  map: {
    flex: 1,
  },
  footer: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
  },
});
