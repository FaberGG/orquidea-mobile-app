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
  isDrawing?: boolean;
  draftCoordinates?: Coordinates[];
  savedLocalTrailCoordinates?: Coordinates[];
  draftStationIds?: string[];
  draftPointLabels?: (string | null)[];
  onStationPress: (station: TrailStation) => void;
  onMapPress?: (coordinates: Coordinates) => void;
  onDraftPointDrag?: (index: number, coordinates: Coordinates) => void;
  style?: StyleProp<ViewStyle>;
};

/** Dibuja los tramos y las estaciones usando el mapa nativo de iOS o Android. */
export const TrailMapView = forwardRef<MapView, TrailMapViewProps>(function TrailMapView(
  {
    map,
    mapType,
    location,
    nearestStationId,
    isDrawing = false,
    draftCoordinates = [],
    savedLocalTrailCoordinates = [],
    draftStationIds = [],
    draftPointLabels = [],
    onStationPress,
    onMapPress,
    onDraftPointDrag,
    style,
  },
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
      accessibilityLabel={
        isDrawing ? 'Toca el mapa para trazar el sendero' : 'Mapa del sendero con sus estaciones'
      }
      onPress={({ nativeEvent }) => {
        if (isDrawing) onMapPress?.(nativeEvent.coordinate);
      }}>
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
      {savedLocalTrailCoordinates.length >= 2 && (
        <Polyline
          coordinates={savedLocalTrailCoordinates}
          strokeColor={theme.primary}
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />
      )}
      {draftCoordinates.length >= 2 && (
        <Polyline
          coordinates={draftCoordinates}
          strokeColor={theme.danger}
          strokeWidth={6}
          lineCap="round"
          lineJoin="round"
        />
      )}
      {isDrawing &&
        draftCoordinates.map((coordinate, index) => {
          const label = draftPointLabels[index];
          return (
            <Marker
              key={`draft-point-${index}`}
              coordinate={coordinate}
              title={label ?? `Punto intermedio ${index + 1}`}
              description={
                label ? 'Estación conectada al sendero' : 'Mantén pulsado para ajustar el trazado'
              }
              draggable={isDrawing && label === null}
              onDragEnd={(event) => onDraftPointDrag?.(index, event.nativeEvent.coordinate)}
              pinColor={theme.danger}
              tracksViewChanges={false}
            />
          );
        })}
      {map.stations.map((station) => {
        const routeIndex = draftStationIds.indexOf(station.id);
        const title = routeIndex >= 0 ? `Parada ${routeIndex + 1}: ${station.name}` : station.name;
        return (
          <Marker
            key={station.id}
            coordinate={station.coordinates}
            title={title}
            description={
              routeIndex >= 0
                ? 'Incluida en el trazado'
                : station.id === nearestStationId
                  ? 'Estación más cercana'
                  : (station.description ?? undefined)
            }
            onPress={() => onStationPress(station)}
            pinColor={
              routeIndex >= 0 || station.id === nearestStationId ? theme.danger : theme.primary
            }
            accessibilityLabel={`${title}${station.id === nearestStationId ? ', estación más cercana' : ''}`}
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
