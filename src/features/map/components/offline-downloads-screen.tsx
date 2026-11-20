import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline, Text as SvgText } from 'react-native-svg';

import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { getTrailMap } from '../api/map.api';
import { type Coordinates, type TrailMap } from '../types';
import { StationScreenHeader } from './station-screen-header';
import {
  deleteOfflineTrail,
  downloadTrail,
  readOfflineTrails,
  type OfflineTrail,
} from '../utils/offline-trails';
import { getLocalTrail, type SavedLocalTrail } from '../utils/trail-storage';

function withLocalTrail(map: TrailMap, trail: SavedLocalTrail | null): TrailMap {
  if (!trail) return map;
  return {
    ...map,
    segments: [
      {
        id: trail.id,
        name: trail.name,
        order: -1,
        coordinates: trail.coordinates,
      },
      ...map.segments.filter((segment) => segment.id !== trail.id),
    ],
  };
}

function localOnlyMap(trail: SavedLocalTrail): TrailMap {
  return {
    version: 'local',
    bounds: null,
    segments: [{ id: trail.id, name: trail.name, order: -1, coordinates: trail.coordinates }],
    stations: [],
  };
}

function TrailDiagram({ pack, location }: { pack: OfflineTrail; location: Coordinates | null }) {
  const theme = useTheme();
  const points = [...pack.segment.coordinates, ...pack.stations.map((s) => s.coordinates)];
  const averageLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
  const scaleLon = Math.max(0.01, Math.cos((averageLat * Math.PI) / 180));
  const xs = points.map((p) => p.longitude * scaleLon);
  const ys = points.map((p) => p.latitude);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const scale = Math.min(
    300 / Math.max(maxX - minX, 0.00001),
    190 / Math.max(maxY - minY, 0.00001),
  );
  const project = (p: { latitude: number; longitude: number }) => ({
    x: 180 + (p.longitude * scaleLon - (minX + maxX) / 2) * scale,
    y: 130 - (p.latitude - (minY + maxY) / 2) * scale,
  });
  const userPoint = location ? project(location) : null;
  const userIsVisible =
    userPoint && userPoint.x >= 12 && userPoint.x <= 348 && userPoint.y >= 12 && userPoint.y <= 248;
  return (
    <View style={[styles.diagram, { backgroundColor: theme.backgroundElement }]}>
      <Svg
        viewBox="0 0 360 260"
        width="100%"
        height={260}
        accessibilityLabel="Esquema del sendero y sus estaciones">
        <Polyline
          points={pack.segment.coordinates
            .map((p) => {
              const { x, y } = project(p);
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke={theme.primary}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pack.stations.map((station) => {
          const { x, y } = project(station.coordinates);
          return (
            <Circle
              key={station.id}
              cx={x}
              cy={y}
              r={9}
              fill={theme.primary}
              stroke={theme.background}
              strokeWidth={2}
            />
          );
        })}
        {userPoint && userIsVisible && (
          <Circle
            cx={userPoint.x}
            cy={userPoint.y}
            r={8}
            fill="#1677E8"
            stroke="#FFFFFF"
            strokeWidth={3}
          />
        )}
        {pack.stations.map((station, index) => {
          const { x, y } = project(station.coordinates);
          return (
            <SvgText
              key={`${station.id}-number`}
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight="bold"
              fill={theme.onPrimary}>
              {index + 1}
            </SvgText>
          );
        })}
        <SvgText
          x={333}
          y={23}
          textAnchor="middle"
          fontSize={15}
          fontWeight="bold"
          fill={theme.text}>
          N ↑
        </SvgText>
      </Svg>
      {userPoint && !userIsVisible && (
        <ThemedText type="caption" themeColor="textSecondary">
          Tu ubicación está fuera del área mostrada.
        </ThemedText>
      )}
    </View>
  );
}

export function OfflineDownloadsScreen() {
  const theme = useTheme();
  const [available, setAvailable] = useState<TrailMap | null>(null);
  const [localTrail, setLocalTrail] = useState<SavedLocalTrail | null>(null);
  const [saved, setSaved] = useState<OfflineTrail[]>([]);
  const [selected, setSelected] = useState<OfflineTrail | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        let local: SavedLocalTrail | null = null;
        try {
          local = await getLocalTrail();
          if (active) setLocalTrail(local);
        } catch {
          if (active) setLocalTrail(null);
        }

        try {
          const map = await getTrailMap();
          if (active) setAvailable(withLocalTrail(map, local));
        } catch {
          if (active) {
            setAvailable(local ? localOnlyMap(local) : null);
            setMessage('Sin conexión al servidor. Puedes abrir los recorridos descargados.');
          }
        }
      })();
      void readOfflineTrails()
        .then((packs) => {
          if (active) setSaved(packs);
        })
        .catch(() => {
          if (active) setMessage('No pudimos leer las descargas.');
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const download = async (id: string) => {
    if (!available || busy) return;
    const segment = available.segments.find((item) => item.id === id);
    if (!segment) return;
    setBusy(true);
    setMessage(null);
    try {
      const pack = await downloadTrail(available, id);
      setSaved(await readOfflineTrails());
      const { available: photosAvailable, saved: photosSaved } = pack.photos ?? {
        available: 0,
        saved: 0,
      };
      if (photosAvailable === 0) {
        setMessage(
          photosSaved > 0
            ? `Recorrido guardado; se conservaron ${photosSaved} fotos que ya tenías descargadas.`
            : 'Recorrido y estaciones guardados. No hay fotos publicadas para este tramo.',
        );
      } else if (photosSaved < photosAvailable) {
        setMessage(
          `Recorrido guardado con ${photosSaved} de ${photosAvailable} fotos. Las demás requieren conexión.`,
        );
      } else {
        setMessage(`Recorrido, estaciones y ${photosSaved} fotos guardados en este dispositivo.`);
      }
    } catch {
      setMessage(
        'No pudimos guardar el recorrido. Revisa el espacio disponible e inténtalo de nuevo.',
      );
    } finally {
      setBusy(false);
    }
  };

  const locate = async () => {
    setIsLocating(true);
    setLocationMessage(null);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationMessage('Permite el acceso a tu ubicación para verla en el recorrido.');
        return;
      }
      const result = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('timeout')), 20000);
        }),
      ]);
      setLocation({ latitude: result.coords.latitude, longitude: result.coords.longitude });
      setLocationMessage(
        result.coords.accuracy === null
          ? 'Punto azul: última ubicación obtenida.'
          : `Punto azul: última ubicación obtenida. Precisión aproximada: ${Math.round(result.coords.accuracy)} m.`,
      );
    } catch {
      setLocationMessage(
        'No pudimos obtener tu ubicación. Activa el GPS e inténtalo al aire libre.',
      );
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setIsLocating(false);
    }
  };

  const remove = (pack: OfflineTrail) =>
    Alert.alert('Eliminar descarga', `¿Eliminar ${pack.segment.name} de este dispositivo?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteOfflineTrail(pack.segment.id);
              setSaved(await readOfflineTrails());
              setSelected(null);
              setMessage('Descarga eliminada.');
            } catch {
              setMessage('No pudimos eliminar la descarga.');
            }
          })();
        },
      },
    ]);

  return (
    <FormScreen>
      <StationScreenHeader title="Descargas sin conexión" />
      {selected ? (
        <>
          <ThemedText type="smallBold">{selected.segment.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Recorrido y estaciones guardados en este dispositivo. Se guardaron{' '}
            {selected.stations.filter((station) => station.photoUri).length} de{' '}
            {selected.photos?.available ??
              selected.stations.filter((station) => station.photoUri).length}{' '}
            fotos disponibles. Aún no se guarda un fondo satelital.
          </ThemedText>
          <TrailDiagram pack={selected} location={location} />
          <Button
            label="MI UBICACIÓN"
            variant="secondary"
            isLoading={isLocating}
            onPress={() => void locate()}
          />
          {locationMessage && (
            <ThemedText type="small" themeColor="textSecondary">
              {locationMessage}
            </ThemedText>
          )}
          {selected.stations.length === 0 ? (
            <ThemedText type="small">No hay estaciones cercanas a este tramo.</ThemedText>
          ) : (
            selected.stations.map((station, index) => (
              <View key={station.id} style={[styles.card, { borderColor: theme.border }]}>
                <ThemedText type="smallBold">
                  {index + 1}. {station.name}
                </ThemedText>
                {station.photoUri ? (
                  <Image
                    source={{ uri: station.photoUri }}
                    contentFit="cover"
                    accessibilityLabel={`Foto de ${station.name}`}
                    style={styles.stationPhoto}
                  />
                ) : (
                  <ThemedText type="caption" themeColor="textSecondary">
                    {station.photoUri === null
                      ? 'Foto no disponible sin conexión.'
                      : 'Esta descarga anterior no contiene fotos.'}
                  </ThemedText>
                )}
                {!!station.description && (
                  <ThemedText type="small" themeColor="textSecondary">
                    {station.description}
                  </ThemedText>
                )}
              </View>
            ))
          )}
          <Button
            label="VOLVER A DESCARGAS"
            variant="secondary"
            onPress={() => setSelected(null)}
          />
        </>
      ) : (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            Guarda el trazado y los datos de las estaciones cercanas para consultarlos sin internet.
          </ThemedText>
          {busy && <ThemedText type="small">Guardando recorrido…</ThemedText>}
          {message && (
            <ThemedText type="small" themeColor="textSecondary">
              {message}
            </ThemedText>
          )}
          <ThemedText type="smallBold">Recorridos descargados</ThemedText>
          {saved.length === 0 && (
            <ThemedText type="small">Aún no hay recorridos descargados.</ThemedText>
          )}
          {saved.map((pack) => (
            <View key={pack.segment.id} style={[styles.card, { borderColor: theme.border }]}>
              <ThemedText type="smallBold">{pack.segment.name}</ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                {pack.stations.length} estaciones cercanas · Descargado{' '}
                {new Date(pack.savedAt).toLocaleDateString('es-CO')}
              </ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                {pack.photos?.saved
                  ? `${pack.photos.saved} fotos de estación guardadas.`
                  : 'Sin fotos de estaciones en esta descarga.'}
              </ThemedText>
              {available &&
                !pack.segment.id.startsWith('local-') &&
                pack.mapVersion !== available.version && (
                  <ThemedText type="caption" themeColor="textSecondary">
                    El mapa cambió desde la descarga. Puedes actualizar este recorrido.
                  </ThemedText>
                )}
              <Button
                label="VER SIN CONEXIÓN"
                onPress={() => {
                  setSelected(pack);
                }}
              />
              <Button
                label="ELIMINAR DESCARGA"
                variant="secondary"
                disabled={busy}
                onPress={() => remove(pack)}
              />
            </View>
          ))}
          {available && (
            <>
              <ThemedText type="smallBold">Disponibles para descargar</ThemedText>
              {available.segments.length === 0 && (
                <ThemedText type="small">Todavía no hay recorridos publicados.</ThemedText>
              )}
              {available.segments.map((segment) => (
                <View key={segment.id} style={[styles.card, { borderColor: theme.border }]}>
                  <ThemedText type="smallBold">
                    {segment.name}
                    {segment.id === localTrail?.id ? ' · Mi trazado' : ''}
                  </ThemedText>
                  <Button
                    label={
                      saved.some((pack) => pack.segment.id === segment.id)
                        ? 'ACTUALIZAR RUTA Y FOTOS'
                        : 'DESCARGAR RUTA Y FOTOS'
                    }
                    disabled={busy}
                    onPress={() => void download(segment.id)}
                  />
                </View>
              ))}
            </>
          )}
        </>
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: Radius.card, padding: Spacing.three, gap: Spacing.two },
  diagram: { borderRadius: Radius.card, overflow: 'hidden' },
  stationPhoto: { width: '100%', height: 180, borderRadius: Radius.medium },
});
