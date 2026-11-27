import {
  Camera,
  type CameraRef,
  Map as MapLibreMap,
  Marker,
  UserLocation,
} from '@maplibre/maplibre-react-native';
import { forwardRef, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { type MapSource } from '../hooks/use-map-source';
import { type Coordinates, type TrailMap, type TrailStation } from '../types';
import { MapAttribution, MapPin, TrailSegmentsLayer, WetlandIllustrationLayer } from './map-layers';
import { getInitialViewState, toLngLat } from '../utils/map-camera';

type TrailMapViewProps = {
  map: TrailMap;
  location: Coordinates | null;
  nearestStationId: string | null;
  onStationPress: (station: TrailStation) => void;
  /** SCRUM-84: fuente del mapa base (OpenFreeMap o PMTiles offline), de `useMapSource`. */
  source: Pick<MapSource, 'mapStyle' | 'onStyleLoaded' | 'onLoadFailed'>;
  style?: StyleProp<ViewStyle>;
};

/**
 * Dibuja, de abajo arriba: el mapa base (OpenFreeMap o el PMTiles offline, SCRUM-84), la ilustración del
 * humedal (desde ~zoom 15), los tramos y las estaciones. La ref expone la cámara para centrar el mapa en la
 * ubicación del visitante.
 */
export const TrailMapView = forwardRef<CameraRef, TrailMapViewProps>(function TrailMapView(
  { map, location, nearestStationId, onStationPress, source, style },
  ref,
) {
  const theme = useTheme();
  // La vista inicial se calcula una vez: si el recorrido se refresca, la cámara no salta.
  const [initialViewState] = useState(() => getInitialViewState(map));

  return (
    <View style={[styles.container, style]}>
      <MapLibreMap
        style={styles.map}
        mapStyle={source.mapStyle}
        attribution={false}
        logo={false}
        compass={false}
        onDidFinishLoadingStyle={source.onStyleLoaded}
        onDidFailLoadingMap={source.onLoadFailed}
        accessibilityLabel="Mapa del sendero con sus estaciones">
        <Camera ref={ref} initialViewState={initialViewState} />
        <WetlandIllustrationLayer />
        <TrailSegmentsLayer id="trail" segments={map.segments} color={theme.primary} width={5} />
        {map.stations.map((station) => {
          const isNearest = station.id === nearestStationId;
          return (
            <Marker
              key={station.id}
              id={station.id}
              lngLat={toLngLat(station.coordinates)}
              onPress={() => onStationPress(station)}>
              <View
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${station.name}${isNearest ? ', estación más cercana' : ''}`}>
                <MapPin color={isNearest ? theme.danger : theme.primary} />
              </View>
            </Marker>
          );
        })}
        {location !== null && <UserLocation accuracy />}
      </MapLibreMap>
      <MapAttribution />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
