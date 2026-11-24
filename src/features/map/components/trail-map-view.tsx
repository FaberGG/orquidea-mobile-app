import { forwardRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { Marker, Polyline, type MapType } from 'react-native-maps';

import { useTheme } from '@/hooks/use-theme';

import { type Coordinates, type TrailMap, type TrailStation } from '../types';
import { getInitialMapRegion } from '../utils/map-region';

type TrailMapViewProps = {
  map: TrailMap;
  mapType: MapType;
  location: Coordinates | null;
  nearestStationId: string | null;
  onStationPress: (station: TrailStation) => void;
  style?: StyleProp<ViewStyle>;
};

/** Dibuja los tramos y las estaciones usando el mapa nativo de iOS o Android. */
export const TrailMapView = forwardRef<MapView, TrailMapViewProps>(function TrailMapView(
  { map, mapType, location, nearestStationId, onStationPress, style },
  ref,
) {
  const theme = useTheme();

  return (
    <MapView
      ref={ref}
      style={[styles.map, style]}
      initialRegion={getInitialMapRegion(map)}
      mapType={mapType}
      showsUserLocation={location !== null}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      accessibilityLabel="Mapa del sendero con sus estaciones">
      {map.segments.map((segment) => (
        <Polyline
          key={segment.id}
          coordinates={segment.coordinates}
          strokeColor={theme.primary}
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />
      ))}
      {map.stations.map((station) => {
        const isNearest = station.id === nearestStationId;
        return (
          <Marker
            key={station.id}
            coordinate={station.coordinates}
            title={station.name}
            description={isNearest ? 'Estación más cercana' : (station.description ?? undefined)}
            onPress={() => onStationPress(station)}
            pinColor={isNearest ? theme.danger : theme.primary}
            accessibilityLabel={`${station.name}${isNearest ? ', estación más cercana' : ''}`}
          />
        );
      })}
    </MapView>
  );
});

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
