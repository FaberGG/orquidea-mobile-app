import {
  Camera,
  type CameraRef,
  type InitialViewState,
  Map as MapLibreMap,
  Marker,
  ViewAnnotation,
} from '@maplibre/maplibre-react-native';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useTheme } from '@/hooks/use-theme';
import { getCurrentLocation } from '@/lib/location';

import { LOCATION_PICKER_LABELS, MAP_STYLE_URL, WETLAND_CENTER } from '../constants';
import { useOfflineTiles } from '../hooks/use-offline-tiles';
import { useTrailMap } from '../hooks/use-trail-map';
import { type Coordinates, type TrailMap } from '../types';
import { MapAttribution, MapPin, TrailSegmentsLayer } from './map-layers';
import {
  fromLngLat,
  getInitialViewState,
  getLocationViewState,
  LOCATION_ZOOM,
  toLngLat,
} from '../utils/map-camera';
import { createOfflineMapStyle } from '../utils/offline-map-style';
import { isInsideOfflineArea } from '../utils/offline-tiles';

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
 * marcador ahí y también se puede arrastrar. CONFIRMAR devuelve las coordenadas. Muestra el sendero y sus
 * estaciones como referencia si ya se cargaron (con o sin conexión, desde la caché de HU-21).
 *
 * SCRUM-85: sin conexión usa el mapa base offline de Popayán incluido en la app (PMTiles) y ofrece elegir
 * el punto por GPS; si el punto queda fuera de Popayán, lo avisa.
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
  const { status: networkStatus } = useNetworkStatus();
  // Estado desconocido = como con conexión (no bloquea, igual que en el resto de la app).
  const isOffline = networkStatus === 'offline';
  const offlineTiles = useOfflineTiles(isOffline);
  const cameraRef = useRef<CameraRef>(null);
  const [point, setPoint] = useState<Coordinates | null>(value);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  // La vista se calcula una vez: si el sendero llega después, no se mueve el mapa bajo el dedo.
  const [initialViewState] = useState(() => getPickerInitialViewState(value, map));

  const offlineTilesUrl = offlineTiles.status === 'ready' ? offlineTiles.url : null;
  const offlineStyle = useMemo(
    () => (offlineTilesUrl ? createOfflineMapStyle(offlineTilesUrl) : null),
    [offlineTilesUrl],
  );
  const mapStyle = isOffline ? offlineStyle : MAP_STYLE_URL;
  const isOutsideOfflineArea = isOffline && point !== null && !isInsideOfflineArea(point);

  const choosePoint = (coordinates: Coordinates) => {
    setLocationError(null);
    setPoint(coordinates);
  };

  const locate = async () => {
    setIsLocating(true);
    setLocationError(null);
    const result = await getCurrentLocation();
    setIsLocating(false);
    if (result.status === 'located') {
      setPoint(result.coordinates);
      cameraRef.current?.flyTo({
        center: toLngLat(result.coordinates),
        zoom: LOCATION_ZOOM,
        duration: 600,
      });
    }
    if (result.status === 'denied') setLocationError(LOCATION_PICKER_LABELS.locationDenied);
    if (result.status === 'error') setLocationError(LOCATION_PICKER_LABELS.locationError);
  };

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
        {isOffline && (
          <ThemedText type="small" themeColor="warning">
            {LOCATION_PICKER_LABELS.offlineHint}
          </ThemedText>
        )}
      </View>

      <View style={styles.map}>
        {mapStyle ? (
          <>
            <MapLibreMap
              style={styles.map}
              mapStyle={mapStyle}
              attribution={false}
              logo={false}
              compass={false}
              onPress={(event) => choosePoint(fromLngLat(event.nativeEvent.lngLat))}
              accessibilityLabel={LOCATION_PICKER_LABELS.mapLabel}>
              <Camera ref={cameraRef} initialViewState={initialViewState} />
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
                  onDragEnd={(event) => choosePoint(fromLngLat(event.nativeEvent.lngLat))}>
                  <View accessible accessibilityLabel={LOCATION_PICKER_LABELS.selectedPoint}>
                    <MapPin color={theme.danger} />
                  </View>
                </ViewAnnotation>
              )}
            </MapLibreMap>
            <MapAttribution />
          </>
        ) : (
          <View style={styles.mapPlaceholder}>
            {offlineTiles.status === 'error' ? (
              <ThemedText type="small" themeColor="textSecondary" accessibilityRole="alert">
                {LOCATION_PICKER_LABELS.offlineMapUnavailable}
              </ThemedText>
            ) : (
              <>
                <ActivityIndicator color={theme.primary} />
                <ThemedText type="small" themeColor="textSecondary">
                  {LOCATION_PICKER_LABELS.offlineMapLoading}
                </ThemedText>
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <ThemedText
          type="smallSemiBold"
          themeColor={point ? 'text' : 'textMuted'}
          accessibilityLiveRegion="polite">
          {point ? LOCATION_PICKER_LABELS.coordinates(point) : LOCATION_PICKER_LABELS.noPoint}
        </ThemedText>
        {isOutsideOfflineArea && (
          <ThemedText type="small" themeColor="warning" accessibilityRole="alert">
            {LOCATION_PICKER_LABELS.outsideOfflineArea}
          </ThemedText>
        )}
        {locationError && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {locationError}
          </ThemedText>
        )}
        {isOffline && (
          <Button
            label={isLocating ? LOCATION_PICKER_LABELS.locating : LOCATION_PICKER_LABELS.useGps}
            variant="secondary"
            disabled={isLocating}
            onPress={() => void locate()}
          />
        )}
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
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
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
