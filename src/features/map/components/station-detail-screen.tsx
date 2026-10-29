import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isApiError } from '@/lib/api';
import { Can } from '@/permissions';

import { STATION_LABELS, STATION_MESSAGES } from '../constants';
import { getStationDeleteErrorMessage, useDeleteStation, useStation } from '../hooks';
import { type Station } from '../types';
import { DeleteStationDialog } from './delete-station-dialog';
import { formatCoordinates, getMapsUrl } from './format-station';

const HERO_HEIGHT = 260;

/**
 * "Ver estación" (HU-13): foto, descripción, ubicación y enlaces a sus fichas (CA4). Es la misma pantalla
 * para todos los roles; Editar y ELIMINAR aparecen con `stations:manage`. Cuando exista el mapa (HU-12),
 * se abrirá al tocar una estación en él.
 */
export function StationDetailScreen({ id }: { id: string }) {
  const { data, isPending, isError, error, refetch } = useStation(id);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (isPending) {
    return (
      <ThemedView style={styles.flex}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  if (isError) {
    const notFound = isApiError(error) && error.status === 404;
    return (
      <ThemedView style={[styles.flex, { paddingTop: insets.top }]}>
        <EmptyState
          icon="location"
          title={notFound ? STATION_MESSAGES.notFound : STATION_MESSAGES.loadError}>
          <Button label={STATION_LABELS.back} variant="link" onPress={() => router.back()} />
          {!notFound && <Button label={STATION_LABELS.retry} onPress={() => void refetch()} />}
        </EmptyState>
      </ThemedView>
    );
  }

  return <StationDetailContent station={data} insetTop={insets.top} />;
}

function StationDetailContent({ station, insetTop }: { station: Station; insetTop: number }) {
  const theme = useTheme();
  const remove = useDeleteStation(station.id);
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmDelete = () =>
    remove.mutate(undefined, {
      onSuccess: () => {
        setIsConfirming(false);
        router.back();
      },
    });

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.backgroundSelected }]}>
          {station.photoUrl && (
            <Image
              source={{ uri: station.photoUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessibilityLabel={STATION_LABELS.photoOf(station.name)}
            />
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={STATION_LABELS.back}
            onPress={() => router.back()}
            style={[styles.backButton, { top: insetTop + Spacing.two }]}>
            <Icon name="chevronLeft" size={20} fixedColor="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.body}>
          <ThemedText style={styles.name} themeColor="textLabel" accessibilityRole="header">
            {station.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.paragraph}>
            {station.description}
          </ThemedText>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Section icon="location" title={STATION_LABELS.locationSection}>
            <ThemedText type="small" themeColor="textSecondary">
              {formatCoordinates(station.location)}
            </ThemedText>
            <Button
              label={STATION_LABELS.openInMaps}
              variant="link"
              onPress={() => void Linking.openURL(getMapsUrl(station.location))}
            />
          </Section>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Section icon="taxonomy" title={STATION_LABELS.speciesSection}>
            {station.species.length === 0 ? (
              <ThemedText type="small" themeColor="textMuted">
                {STATION_LABELS.speciesCount(0)}
              </ThemedText>
            ) : (
              <View style={styles.speciesList}>
                {station.species.map((species) => (
                  <Pressable
                    key={species.id}
                    accessibilityRole="link"
                    accessibilityLabel={species.vernacularName}
                    onPress={() =>
                      router.push({ pathname: '/species/[id]', params: { id: species.id } })
                    }
                    style={({ pressed }) => [
                      styles.speciesRow,
                      { borderColor: theme.border },
                      pressed && styles.pressed,
                    ]}>
                    {species.photoUrl ? (
                      <Image
                        source={{ uri: species.photoUrl }}
                        style={styles.speciesThumb}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[styles.speciesThumb, { backgroundColor: theme.backgroundSelected }]}
                      />
                    )}
                    <ThemedText type="smallBold" themeColor="textLabel" style={styles.flex}>
                      {species.vernacularName}
                    </ThemedText>
                    <Icon name="chevronRight" size={18} color="textMuted" />
                  </Pressable>
                ))}
              </View>
            )}
          </Section>

          <Can permission="stations:manage">
            <View style={styles.actions}>
              <Button
                label={STATION_LABELS.edit}
                onPress={() =>
                  router.push({ pathname: '/stations/[id]/edit', params: { id: station.id } })
                }
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={STATION_LABELS.delete}
                onPress={() => {
                  remove.reset();
                  setIsConfirming(true);
                }}
                style={[styles.deleteButton, { borderColor: theme.danger }]}>
                <Icon name="delete" size={18} color="danger" />
                <ThemedText type="smallBold" themeColor="danger">
                  {STATION_LABELS.delete}
                </ThemedText>
              </Pressable>
            </View>
          </Can>
        </View>
      </ScrollView>

      <DeleteStationDialog
        isVisible={isConfirming}
        isDeleting={remove.isPending}
        errorMessage={remove.isError ? getStationDeleteErrorMessage(remove.error) : undefined}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirming(false)}
      />
    </ThemedView>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: 'location' | 'taxonomy';
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitle}>
        <Icon name={icon} size={18} color="primary" />
        <ThemedText style={styles.sectionTitleText} themeColor="primary" accessibilityRole="header">
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: Spacing.six,
  },
  hero: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    left: Spacing.three,
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 15, 10, 0.45)',
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
  },
  paragraph: {
    lineHeight: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionTitleText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  speciesList: {
    gap: Spacing.two,
  },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  speciesThumb: {
    width: 44,
    height: 44,
    borderRadius: Radius.small,
  },
  pressed: {
    opacity: 0.7,
  },
  actions: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 48,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
