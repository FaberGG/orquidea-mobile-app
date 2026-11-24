import {
  Camera,
  type InitialViewState,
  Map as MapLibreMap,
  Marker,
  ViewAnnotation,
} from '@maplibre/maplibre-react-native';
import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { LOCATION_PICKER_LABELS, MAP_STYLE_URL, WETLAND_CENTER } from '../constants';
import { useTrailMap } from '../hooks/use-trail-map';
import { type Coordinates, type TrailMap } from '../types';
import { MapAttribution, MapPin, TrailSegmentsLayer } from './map-layers';
import {
  fromLngLat,
  getInitialViewState,
  getLocationViewState,
  toLngLat,
} from '../utils/map-camera';

export type MapLocationPickerProps = {
  visible: boolean;
  /** Punto ya elegido (se centra ahí y se puede mover). */
  value: Coordinates | null;
  onConfirm: (coordinates: Coordinates) => void;
  onCancel: () => void;
};

/** Vista inicial: el punto elegido; si no hay, el sendero; si tampoco carga, el humedal. */
export function getPickerInitialViewState(
  value: Coordinates | null,
  map?: TrailMap,
): InitialViewState {
  if (value) return getLocationViewState(value);
  if (map && (map.bounds || map.segments.length > 0 || map.stations.length > 0)) {
    return getInitialViewState(map);
  }
  return getLocationViewState(WETLAND_CENTER);
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
  // La vista se calcula una vez: si el sendero llega después, no se mueve el mapa bajo el dedo.
  const [initialViewState] = useState(() => getPickerInitialViewState(value, map));

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

      <View style={styles.map}>
        <MapLibreMap
          style={styles.map}
          mapStyle={MAP_STYLE_URL}
          attribution={false}
          logo={false}
          compass={false}
          onPress={(event) => setPoint(fromLngLat(event.nativeEvent.lngLat))}
          accessibilityLabel={LOCATION_PICKER_LABELS.mapLabel}>
          <Camera initialViewState={initialViewState} />
          {map && (
            <TrailSegmentsLayer
              id="picker"
              segments={map.segments}
              color={theme.primary}
              width={4}
            />
          )}
          {map?.stations.map((station) => (
            <Marker key={station.id} id={station.id} lngLat={toLngLat(station.coordinates)}>
              <View accessible accessibilityLabel={station.name}>
                <MapPin color={theme.primary} opacity={0.6} />
              </View>
            </Marker>
          ))}
          {point && (
            <ViewAnnotation
              id="selected-point"
              lngLat={toLngLat(point)}
              draggable
              onDragEnd={(event) => setPoint(fromLngLat(event.nativeEvent.lngLat))}>
              <View accessible accessibilityLabel={LOCATION_PICKER_LABELS.selectedPoint}>
                <MapPin color={theme.danger} />
              </View>
            </ViewAnnotation>
          )}
        </MapLibreMap>
        <MapAttribution />
      </View>

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
