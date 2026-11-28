import { type CameraRef } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormMessage } from '@/components/feedback/form-message';
import { Screen } from '@/components/layout/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePermission } from '@/permissions';

import { getNearestStation } from '../api';
import { MAP_LABELS, MAP_SOURCE_MESSAGES } from '../constants';
import { useTrailMap } from '../hooks';
import { useMapSource } from '../hooks/use-map-source';
import { type Coordinates, type TrailStation } from '../types';
import { MapControls } from './map-controls';
import { StationDetailsCard } from './station-details-card';
import { TrailMapView } from './trail-map-view';
import { getLocationViewState } from '../utils/map-camera';
import { isInsideOfflineArea } from '../utils/offline-tiles';

/** HU-12: mapa del recorrido, estaciones, geolocalización y ficha de cada estación. */
export function MapScreen() {
  const theme = useTheme();
  const cameraRef = useRef<CameraRef>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const followsNearestStation = useRef(false);
  const { data, isPending, isError, refetch } = useTrailMap();
  const mapSource = useMapSource();
  const canManageMap = usePermission('stations:manage');
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(
      () => () => {
        locationSubscription.current?.remove();
        locationSubscription.current = null;
      },
      [],
    ),
  );

  if (isPending) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} accessibilityLabel={MAP_LABELS.loading} />
        </View>
      </Screen>
    );
  }

  if (isError && data === undefined) {
    return (
      <Screen>
        <EmptyState icon="map" title={MAP_LABELS.loadError}>
          <Button label={MAP_LABELS.retry} onPress={() => void refetch()} />
        </EmptyState>
      </Screen>
    );
  }

  if (!data || (data.segments.length === 0 && data.stations.length === 0)) {
    return (
      <Screen>
        <EmptyState
          icon="map"
          title={MAP_LABELS.emptyTitle}
          description={MAP_LABELS.emptyDescription}>
          <Button label={MAP_LABELS.retry} onPress={() => void refetch()} />
        </EmptyState>
      </Screen>
    );
  }

  const nearest = location ? getNearestStation(data.stations, location) : null;
  const selectedStation = data.stations.find((station) => station.id === selectedStationId) ?? null;
  const isOutsideOfflineArea =
    mapSource.mode === 'offline' && location !== null && !isInsideOfflineArea(location);

  const locate = async () => {
    setIsLocating(true);
    setLocationMessage(null);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setLocationMessage(MAP_LABELS.locationDenied);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coordinates = { latitude: coords.latitude, longitude: coords.longitude };
      setLocation(coordinates);
      const closest = getNearestStation(data.stations, coordinates);
      followsNearestStation.current = true;
      setSelectedStationId(closest?.station.id ?? null);
      cameraRef.current?.flyTo({ ...getLocationViewState(coordinates), duration: 500 });

      if (locationSubscription.current === null) {
        try {
          locationSubscription.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5_000,
              distanceInterval: 10,
            },
            ({ coords: currentCoords }) => {
              const currentLocation = {
                latitude: currentCoords.latitude,
                longitude: currentCoords.longitude,
              };
              setLocation(currentLocation);
              if (followsNearestStation.current) {
                setSelectedStationId(
                  getNearestStation(data.stations, currentLocation)?.station.id ?? null,
                );
              }
            },
          );
        } catch {
          setLocationMessage(MAP_LABELS.locationTrackingUnavailable);
        }
      }
    } catch {
      setLocationMessage(MAP_LABELS.locationUnavailable);
    } finally {
      setIsLocating(false);
    }
  };

  const openSpecies = (speciesId: string) => {
    router.push({ pathname: '/species/[id]', params: { id: speciesId } });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <TrailMapView
          ref={cameraRef}
          map={data}
          location={location}
          source={mapSource}
          nearestStationId={nearest?.station.id ?? null}
          onStationPress={(station: TrailStation) => {
            followsNearestStation.current = false;
            setSelectedStationId(station.id);
          }}
        />
        <View style={styles.controls}>
          <MapControls
            isLocating={isLocating}
            nearest={nearest}
            canManageMap={canManageMap}
            onLocate={() => void locate()}
            onCreateStation={() => router.push('/stations/new' as Href)}
          />
          {locationMessage !== null && <FormMessage message={locationMessage} />}
          {isOutsideOfflineArea && (
            <View style={[styles.notice, { backgroundColor: theme.background }]}>
              <ThemedText type="small" themeColor="warning" accessibilityRole="alert">
                {MAP_SOURCE_MESSAGES.outsideOfflineArea}
              </ThemedText>
            </View>
          )}
        </View>
        {selectedStation !== null && (
          <StationDetailsCard
            station={selectedStation}
            onClose={() => setSelectedStationId(null)}
            onSpeciesPress={openSpecies}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  notice: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
  },
  controls: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    gap: Spacing.two,
  },
});
