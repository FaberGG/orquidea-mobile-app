import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { MAP_ATTRIBUTION } from '../constants';
import { type TrailSegment } from '../types';
import { toLngLat } from '../utils/map-camera';

type TrailSegmentsLayerProps = {
  /** Prefijo único por mapa para los ids de la fuente y la capa. */
  id: string;
  segments: TrailSegment[];
  color: string;
  width: number;
};

/** Dibuja los tramos del recorrido (`GET /api/mapa`) como una línea GeoJSON sobre el mapa base. */
export function TrailSegmentsLayer({ id, segments, color, width }: TrailSegmentsLayerProps) {
  const data = useMemo<GeoJSON.FeatureCollection<GeoJSON.LineString>>(
    () => ({
      type: 'FeatureCollection',
      features: segments
        .filter((segment) => segment.coordinates.length >= 2)
        .map((segment) => ({
          type: 'Feature',
          id: segment.id,
          properties: { name: segment.name },
          geometry: { type: 'LineString', coordinates: segment.coordinates.map(toLngLat) },
        })),
    }),
    [segments],
  );

  return (
    <GeoJSONSource id={`${id}-segments`} data={data}>
      <Layer
        type="line"
        id={`${id}-segments-line`}
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{ 'line-color': color, 'line-width': width }}
      />
    </GeoJSONSource>
  );
}

/** Pin circular de una estación o de un punto elegido (lo envuelve un `Marker` o `ViewAnnotation`). */
export function MapPin({ color, opacity = 1 }: { color: string; opacity?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[styles.pin, { backgroundColor: color, borderColor: theme.background, opacity }]}
    />
  );
}

/** Atribución obligatoria de OpenStreetMap y OpenMapTiles, siempre visible sobre el mapa. */
export function MapAttribution() {
  const theme = useTheme();
  return (
    <View
      pointerEvents="none"
      style={[styles.attribution, { backgroundColor: theme.background }]}
      accessibilityRole="text">
      <ThemedText type="caption" themeColor="textSecondary">
        {MAP_ATTRIBUTION}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    elevation: 3,
  },
  attribution: {
    position: 'absolute',
    right: Spacing.one,
    bottom: Spacing.one,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.medium,
    opacity: 0.85,
  },
});
