import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

import { CONSERVATION_STATUSES, SPECIES_LABELS } from '../constants';
import { useSpecies } from '../hooks';
import { type Species } from '../types';
import { ConservationBadge } from './conservation';

const HERO_HEIGHT = 376;

export type SpeciesDetailScreenProps = {
  id: string;
};

/**
 * Detalle de una ficha (Figma: "Detalle ficha"). Es la misma pantalla para todos los roles: las
 * acciones de edición y eliminación aparecen solo con su permiso (`<Can>`, ROLES-Y-PERMISOS §3).
 */
export function SpeciesDetailScreen({ id }: SpeciesDetailScreenProps) {
  const { data, isPending, isError, error, refetch } = useSpecies(id);
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
          icon="wetland"
          title={notFound ? SPECIES_LABELS.notFound : SPECIES_LABELS.loadError}>
          <Button label={SPECIES_LABELS.back} onPress={() => router.back()} variant="link" />
          {!notFound && <Button label={SPECIES_LABELS.retry} onPress={() => void refetch()} />}
        </EmptyState>
      </ThemedView>
    );
  }

  return <SpeciesDetailContent species={data} insetTop={insets.top} />;
}

function SpeciesDetailContent({ species, insetTop }: { species: Species; insetTop: number }) {
  const theme = useTheme();
  const { label } = CONSERVATION_STATUSES[species.conservationStatus];

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {species.photoUrl ? (
            <Image
              source={{ uri: species.photoUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundSelected }]}
            />
          )}
          <View style={styles.scrim} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={SPECIES_LABELS.back}
            onPress={() => router.back()}
            style={[styles.backButton, { top: insetTop + Spacing.two }]}>
            <Icon name="chevronLeft" size={20} color="onPrimary" />
          </Pressable>

          <View style={styles.heroLabel}>
            <ThemedText style={styles.heroName} accessibilityRole="header">
              {species.vernacularName}
            </ThemedText>
            <ThemedText style={styles.heroScientific}>{species.scientificName}</ThemedText>
          </View>
        </View>

        <View style={styles.body}>
          <View
            style={styles.conservationRow}
            accessibilityLabel={SPECIES_LABELS.conservationLabel}>
            <ConservationBadge status={species.conservationStatus} />
            <ThemedText type="smallSemiBold" themeColor="textSecondary">
              {label}
            </ThemedText>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Section icon="taxonomy" title={SPECIES_LABELS.sectionTaxonomy}>
            <View style={[styles.grid, { borderColor: theme.border }]}>
              <GridRow label={SPECIES_LABELS.rowOrder} value={species.order} />
              <GridRow label={SPECIES_LABELS.rowFamily} value={species.family} />
              <GridRow label={SPECIES_LABELS.rowGenus} value={species.genus} italic />
              <GridRow
                label={SPECIES_LABELS.rowSpecies}
                value={species.scientificName}
                italic
                last
              />
            </View>
          </Section>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Section icon="diet" title={SPECIES_LABELS.sectionDiet}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.paragraph}>
              {species.diet || SPECIES_LABELS.noData}
            </ThemedText>
          </Section>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Sin clasificación de rol en la API: se muestra solo el texto (decisión de producto). */}
          <Section icon="wetlandRole" title={SPECIES_LABELS.sectionWetlandRole}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.paragraph}>
              {species.wetlandRole || SPECIES_LABELS.noData}
            </ThemedText>
          </Section>

          <Can permission="species:update">
            <Button
              label={SPECIES_LABELS.editButton}
              // HU-8: la pantalla de edición llega con su historia; se deja visible para el rol.
              disabled
            />
          </Can>

          <Can permission="species:delete">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={SPECIES_LABELS.deleteButton}
              // HU-9: la API aún no tiene DELETE /api/fichas-taxonomicas/{id} (docs/api B1).
              disabled
              style={[styles.deleteButton, { borderColor: theme.danger }]}>
              <Icon name="delete" size={18} color="danger" />
              <ThemedText type="smallBold" themeColor="danger">
                {SPECIES_LABELS.deleteButton}
              </ThemedText>
            </Pressable>
          </Can>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

type SectionProps = {
  icon: 'taxonomy' | 'diet' | 'wetlandRole';
  title: string;
  children: ReactNode;
};

function Section({ icon, title, children }: SectionProps) {
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

function GridRow({
  label,
  value,
  italic = false,
  last = false,
}: {
  label: string;
  value: string | null;
  italic?: boolean;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.gridRow,
        !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}>
      <ThemedText style={styles.gridLabel} themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText style={[styles.gridValue, italic && styles.italic]} themeColor="textLabel">
        {value || SPECIES_LABELS.noData}
      </ThemedText>
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
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 15, 10, 0.4)',
  },
  backButton: {
    position: 'absolute',
    left: Spacing.three,
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  heroLabel: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  heroName: {
    color: '#F7F8F8',
    fontFamily: FontFamily.bold,
    fontSize: 26,
    lineHeight: 30,
  },
  heroScientific: {
    color: '#F7F8F8',
    fontFamily: FontFamily.regular,
    fontStyle: 'italic',
    fontSize: 14,
  },
  body: {
    gap: 20,
    paddingHorizontal: Spacing.three,
    paddingTop: 20,
  },
  conservationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  section: {
    gap: 10,
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
  grid: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  gridLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    lineHeight: 18,
    width: 110,
  },
  gridValue: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  italic: {
    fontStyle: 'italic',
  },
  paragraph: {
    lineHeight: 22,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.pill,
    backgroundColor: 'transparent',
  },
});
