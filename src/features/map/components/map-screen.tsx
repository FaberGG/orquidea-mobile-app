import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import { router, useFocusEffect, type Href } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { type MapType } from 'react-native-maps';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormMessage } from '@/components/feedback/form-message';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePermission } from '@/permissions';

import { getNearestStation } from '../api';
import { MAP_LABELS } from '../constants';
import { useTrailMap } from '../hooks';
import { type Coordinates, type TrailStation } from '../types';
import { MapControls } from './map-controls';
import { StationDetailsCard } from './station-details-card';
import { TrailDrawingPanel } from './trail-drawing-panel';
import { TrailMapView } from './trail-map-view';
import { getLocationMapRegion } from '../utils/map-region';
import { buildTrailGpx, trailGpxFileName } from '../utils/trail-gpx';
import { getLocalTrail, saveLocalTrail } from '../utils/trail-storage';

/** HU-12: mapa del recorrido, estaciones, geolocalización y ficha de cada estación. */
export function MapScreen() {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const followsNearestStation = useRef(false);
  const { data, isPending, isError, refetch } = useTrailMap();
  const canManageMap = usePermission('stations:manage');
  const [mapType, setMapType] = useState<MapType>('standard');
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [trailName, setTrailName] = useState('Sendero de prueba');
  const [draftPoints, setDraftPoints] = useState<
    { coordinates: Coordinates; stationId?: string }[]
  >([]);
  const [drawingMessage, setDrawingMessage] = useState<string | null>(null);
  const [localTrailPreview, setLocalTrailPreview] = useState<Coordinates[] | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingLocalTrail, setIsSavingLocalTrail] = useState(false);

  useEffect(() => {
    let isActive = true;
    void getLocalTrail().then((savedTrail) => {
      if (isActive && savedTrail !== null) setLocalTrailPreview(savedTrail.coordinates);
    });
    return () => {
      isActive = false;
    };
  }, []);

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
  const draftCoordinates = draftPoints.map((point) => point.coordinates);
  const draftStationIds = draftPoints.flatMap((point) =>
    point.stationId ? [point.stationId] : [],
  );
  const draftPointLabels = draftPoints.map((point, index) => {
    if (!point.stationId) return null;
    const station = data.stations.find((item) => item.id === point.stationId);
    return station
      ? `Parada ${draftStationIds.indexOf(point.stationId) + 1}: ${station.name}`
      : `Punto ${index + 1}`;
  });
  const draftStationNames = draftStationIds.flatMap((id) => {
    const station = data.stations.find((item) => item.id === id);
    return station ? [station.name] : [];
  });

  const startDrawing = () => {
    setSelectedStationId(null);
    setDraftPoints([]);
    setDrawingMessage(null);
    setTrailName('Sendero de prueba');
    setIsDrawing(true);
  };

  const addDraftPoint = (coordinates: Coordinates) => {
    if (isDrawing) setDraftPoints((current) => [...current, { coordinates }]);
  };

  const addDraftStation = (station: TrailStation) => {
    if (!isDrawing) return;
    if (draftStationIds.includes(station.id)) {
      setDrawingMessage(
        `${station.name} ya está en el recorrido. Toca otra estación para continuar.`,
      );
      return;
    }
    setDrawingMessage(null);
    setDraftPoints((current) => [
      ...current,
      { coordinates: station.coordinates, stationId: station.id },
    ]);
  };

  const cancelDrawing = () => {
    setDraftPoints([]);
    setIsDrawing(false);
  };

  const exportTrail = async () => {
    if (
      draftCoordinates.length < 2 ||
      trailName.trim().length === 0 ||
      isExporting ||
      isSavingLocalTrail
    )
      return;

    const directory = FileSystem.documentDirectory;
    if (directory === null) {
      Alert.alert('No se pudo guardar', 'El dispositivo no permitió guardar el archivo GPX.');
      return;
    }

    setIsExporting(true);
    const fileUri = `${directory}${trailGpxFileName(trailName)}`;
    try {
      await FileSystem.writeAsStringAsync(fileUri, buildTrailGpx(trailName, draftCoordinates), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: 'Compartir sendero GPX',
          mimeType: 'application/gpx+xml',
          UTI: 'public.xml',
        });
      } else {
        Alert.alert('Sendero guardado', 'El archivo GPX quedó guardado en este dispositivo.');
      }
    } catch {
      Alert.alert('No se pudo exportar', 'Inténtalo de nuevo para guardar el sendero como GPX.');
    } finally {
      setIsExporting(false);
    }
  };

  const saveTrailLocally = async () => {
    if (
      draftCoordinates.length < 2 ||
      trailName.trim().length === 0 ||
      isSavingLocalTrail ||
      isExporting
    )
      return;

    setIsSavingLocalTrail(true);
    try {
      await saveLocalTrail({
        name: trailName.trim(),
        coordinates: draftCoordinates,
        stationIds: draftStationIds,
      });
      setLocalTrailPreview(draftCoordinates);
      setDraftPoints([]);
      setIsDrawing(false);
      Alert.alert('Ruta guardada', 'El sendero quedó trazado en el mapa de este iPhone.');
    } catch {
      Alert.alert(
        'No se pudo guardar',
        'Inténtalo de nuevo para dejar el sendero trazado en el mapa.',
      );
    } finally {
      setIsSavingLocalTrail(false);
    }
  };

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
      mapRef.current?.animateToRegion(getLocationMapRegion(coordinates), 500);

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
          ref={mapRef}
          map={data}
          mapType={mapType}
          location={location}
          nearestStationId={nearest?.station.id ?? null}
          isDrawing={isDrawing}
          draftCoordinates={isDrawing ? draftCoordinates : []}
          savedLocalTrailCoordinates={localTrailPreview ?? []}
          draftStationIds={isDrawing ? draftStationIds : []}
          draftPointLabels={isDrawing ? draftPointLabels : []}
          onMapPress={addDraftPoint}
          onDraftPointDrag={(index, coordinates) =>
            setDraftPoints((current) =>
              current.map((point, pointIndex) =>
                pointIndex === index ? { ...point, coordinates } : point,
              ),
            )
          }
          onStationPress={(station: TrailStation) => {
            if (isDrawing) {
              addDraftStation(station);
              return;
            }
            followsNearestStation.current = false;
            setSelectedStationId(station.id);
          }}
        />
        <View style={styles.controls}>
          <MapControls
            mapType={mapType}
            isLocating={isLocating}
            nearest={nearest}
            canManageMap={canManageMap}
            isDrawing={isDrawing}
            onMapTypeChange={setMapType}
            onLocate={() => void locate()}
            onCreateStation={() => router.push('/stations/new' as Href)}
            onStartDrawing={startDrawing}
          />
          {locationMessage !== null && <FormMessage message={locationMessage} />}
        </View>
        {isDrawing && (
          <TrailDrawingPanel
            name={trailName}
            pointCount={draftCoordinates.length}
            stationNames={draftStationNames}
            message={drawingMessage}
            isSaving={isSavingLocalTrail}
            isExporting={isExporting}
            onNameChange={setTrailName}
            onUndo={() => {
              setDraftPoints((current) => current.slice(0, -1));
              setDrawingMessage(null);
            }}
            onClear={() => {
              setDraftPoints([]);
              setDrawingMessage(null);
            }}
            onCancel={cancelDrawing}
            onSaveLocally={() => void saveTrailLocally()}
            onExport={() => void exportTrail()}
          />
        )}
        {!isDrawing && selectedStation !== null && (
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
  controls: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    gap: Spacing.two,
  },
});
