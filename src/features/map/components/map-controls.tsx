import { useState } from 'react';
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
  canManageMap: boolean;
  isDrawing: boolean;
  onMapTypeChange: (mapType: MapType) => void;
  onLocate: () => void;
  onCreateStation: () => void;
  onStartDrawing: () => void;
};

/** Controles flotantes para cambiar la capa del mapa y centrar la ubicación actual. */
export function MapControls({
  mapType,
  isLocating,
  nearest,
  canManageMap,
  isDrawing,
  onMapTypeChange,
  onLocate,
  onCreateStation,
  onStartDrawing,
}: MapControlsProps) {
  const theme = useTheme();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const nextMapType = mapType === 'satellite' ? 'standard' : 'satellite';
  const nextMapTypeLabel = mapType === 'satellite' ? MAP_LABELS.standard : MAP_LABELS.satellite;

  return (
    <View style={styles.container}>
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
        {canManageMap && !isDrawing && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isAdminMenuOpen ? 'Cerrar gestión del mapa' : 'Gestionar mapa'}
            accessibilityState={{ expanded: isAdminMenuOpen }}
            onPress={() => setIsAdminMenuOpen((isOpen) => !isOpen)}
            style={({ pressed }) => [
              styles.adminButton,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
            ]}>
            <Icon name="add" size={19} color="onPrimary" />
            <ThemedText type="smallBold" themeColor="onPrimary">
              Gestionar mapa
            </ThemedText>
          </Pressable>
        )}
        {!isDrawing && (
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
        )}
        {nearest !== null && (
          <View style={[styles.nearest, { backgroundColor: theme.background }]}>
            <ThemedText type="captionBold" themeColor="textLabel">
              {`${MAP_LABELS.nearestStation}: ${nearest.station.name} · ${MAP_LABELS.distance(nearest.distanceMeters)}`}
            </ThemedText>
          </View>
        )}
      </View>
      {canManageMap && isAdminMenuOpen && !isDrawing && (
        <View
          style={[
            styles.adminMenu,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}>
          <ThemedText type="captionBold" themeColor="textMuted">
            GESTIÓN DEL MAPA
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Crear estación"
            onPress={() => {
              setIsAdminMenuOpen(false);
              onCreateStation();
            }}
            style={({ pressed }) => [styles.adminMenuAction, pressed && styles.pressed]}>
            <Icon name="location" size={20} color="primary" />
            <View style={styles.adminMenuText}>
              <ThemedText type="smallBold" themeColor="textLabel">
                Crear estación
              </ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                Añadir un punto al mapa
              </ThemedText>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Trazar sendero"
            onPress={() => {
              setIsAdminMenuOpen(false);
              onStartDrawing();
            }}
            style={({ pressed }) => [styles.adminMenuAction, pressed && styles.pressed]}>
            <Icon name="edit" size={20} color="primary" />
            <View style={styles.adminMenuText}>
              <ThemedText type="smallBold" themeColor="textLabel">
                Trazar sendero
              </ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                Marcar el recorrido punto por punto
              </ThemedText>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
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
  adminButton: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    elevation: 2,
  },
  adminMenu: {
    position: 'absolute',
    top: MinTouchSize + Spacing.two,
    right: 0,
    left: 0,
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
    elevation: 6,
    zIndex: 10,
  },
  adminMenuAction: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.medium,
  },
  adminMenuText: {
    flex: 1,
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
