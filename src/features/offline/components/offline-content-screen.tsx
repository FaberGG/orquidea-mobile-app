import { type Href, router } from 'expo-router';
import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useStationsOfflineCount } from '@/features/map';
import { useSpeciesOfflineSummary } from '@/features/species';
import { useConnectivity } from '@/hooks/use-connectivity';
import { useOfflineSyncStatus } from '@/hooks/use-offline-sync-status';
import { useTheme } from '@/hooks/use-theme';
import { requestOfflineSync } from '@/lib/offline';

import { OFFLINE_CONTENT_LABELS as LABELS } from '../constants';

const dateFormat = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * HU-21: "Contenido sin conexión" (menú lateral). Resume qué está guardado en el dispositivo (fichas con sus
 * fotos, estaciones), el estado de la última actualización y permite pedir una ahora. El mapa sin conexión
 * llegará con MapLibre (SCRUM-68/69).
 */
export function OfflineContentScreen() {
  const theme = useTheme();
  const connectivity = useConnectivity();
  const { phase, files, lastSuccessAt } = useOfflineSyncStatus();
  const species = useSpeciesOfflineSummary();
  const stations = useStationsOfflineCount();

  const offline = connectivity === 'offline';
  const syncing = phase === 'syncing';

  let status: string;
  if (offline) status = LABELS.statusOffline;
  else if (syncing && files.total > 0) status = LABELS.statusProgress(files.done, files.total);
  else if (syncing) status = LABELS.statusSyncing;
  else if (phase === 'failed') status = LABELS.statusFailed;
  else if (lastSuccessAt === null) status = LABELS.statusNever;
  else status = LABELS.lastUpdated(dateFormat.format(lastSuccessAt));

  return (
    <FormScreen>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={LABELS.back}
          onPress={() => router.back()}
          hitSlop={Spacing.two}
          style={styles.side}>
          <Icon name="chevronLeft" size={22} color="textLabel" />
        </Pressable>
        <ThemedText
          style={styles.title}
          themeColor="textLabel"
          accessibilityRole="header"
          numberOfLines={1}>
          {LABELS.title}
        </ThemedText>
        <View style={styles.side} />
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.intro}>
        {LABELS.intro}
      </ThemedText>

      <Section icon="offline" title={LABELS.statusTitle}>
        <View style={styles.statusRow} accessibilityLiveRegion="polite">
          {syncing && !offline && <ActivityIndicator size="small" color={theme.primary} />}
          <ThemedText type="small" themeColor="textSecondary" style={styles.flexText}>
            {status}
          </ThemedText>
        </View>
        <Button
          label={LABELS.updateNow}
          variant="secondary"
          disabled={offline || syncing}
          onPress={requestOfflineSync}
        />
      </Section>

      <Section icon="categoryAll" title={LABELS.speciesTitle}>
        <ThemedText type="small" themeColor="textSecondary">
          {species && species.total > 0
            ? LABELS.speciesSummary(species.complete, species.total)
            : LABELS.speciesEmpty}
        </ThemedText>
        {species && species.total > 0 && (
          <Button
            label={LABELS.speciesOpen}
            variant="link"
            onPress={() => router.navigate('/' as Href)}
          />
        )}
      </Section>

      <Section icon="location" title={LABELS.stationsTitle}>
        <ThemedText type="small" themeColor="textSecondary">
          {stations ? LABELS.stationsSummary(stations) : LABELS.stationsEmpty}
        </ThemedText>
        {Boolean(stations) && (
          <Button
            label={LABELS.stationsOpen}
            variant="link"
            onPress={() => router.navigate('/stations' as Href)}
          />
        )}
      </Section>

      <Section icon="map" title={LABELS.mapTitle}>
        <ThemedText type="small" themeColor="textSecondary">
          {LABELS.mapIncluded}
        </ThemedText>
      </Section>
    </FormScreen>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <View style={styles.cardTitle}>
        <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
          <Icon name={icon} size={20} color="primary" />
        </View>
        <ThemedText style={styles.cardTitleText} themeColor="textLabel" accessibilityRole="header">
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  side: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  intro: {
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderRadius: Radius.card,
    borderWidth: 1,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flexText: {
    flexShrink: 1,
  },
});
