import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { OfflineImage } from '@/components/ui/offline-image';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Can } from '@/permissions';

import { STATION_LABELS, STATION_MESSAGES } from '../constants';
import { useStations } from '../hooks';
import { type Station } from '../types';
import { StationScreenHeader } from './station-screen-header';

const THUMB_SIZE = 72;

/**
 * Estaciones del sendero (HU-13). Es pública: desde aquí se llega a "Ver estación". Mientras no exista el
 * mapa (HU-12) se abre desde la pestaña Mapas; este listado se conserva como vista alternativa. Los administradores
 * ven el botón **+** para crear (`stations:manage`).
 */
export function StationsListScreen() {
  const { data, isPending, isError, fetchStatus, refetch } = useStations();
  const theme = useTheme();

  return (
    <FormScreen>
      <StationScreenHeader
        title={STATION_LABELS.listTitle}
        right={
          <Can permission="stations:manage">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={STATION_LABELS.create}
              onPress={() => router.push('/stations/new' as Href)}
              hitSlop={Spacing.two}>
              <Icon name="add" size={24} color="primary" />
            </Pressable>
          </Can>
        }
      />
      <ThemedText type="small" themeColor="textSecondary">
        {STATION_LABELS.listSubtitle}
      </ThemedText>

      {data === undefined && fetchStatus === 'paused' ? (
        // HU-21 CA2: sin conexión y sin copia guardada.
        <EmptyState icon="location" title={STATION_MESSAGES.offlineUnavailable}>
          <Button label={STATION_LABELS.retry} onPress={() => void refetch()} />
        </EmptyState>
      ) : isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : isError && data === undefined ? (
        <EmptyState icon="location" title={STATION_MESSAGES.loadError}>
          <Button label={STATION_LABELS.retry} onPress={() => void refetch()} />
        </EmptyState>
      ) : data === undefined || data.length === 0 ? (
        <EmptyState icon="location" title={STATION_MESSAGES.empty} />
      ) : (
        <View style={styles.list}>
          {data.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onPress={() =>
                router.push({
                  pathname: '/stations/[id]',
                  params: { id: station.id },
                } as unknown as Href)
              }
            />
          ))}
        </View>
      )}
    </FormScreen>
  );
}

function StationCard({ station, onPress }: { station: Station; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={station.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      {station.photoUrl ? (
        <OfflineImage uri={station.photoUrl} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.placeholder, { backgroundColor: theme.primarySoft }]}>
          <Icon name="location" size={28} color="primary" />
        </View>
      )}
      <View style={styles.cardText}>
        <ThemedText style={styles.cardTitle} themeColor="textLabel" numberOfLines={1}>
          {station.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {station.description}
        </ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          {STATION_LABELS.speciesCount(station.species.length)}
        </ThemedText>
      </View>
      <Icon name="chevronRight" size={20} color="textMuted" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radius.medium + Spacing.one,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.7,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.medium,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: Spacing.half,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
});
