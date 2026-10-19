import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { KINGDOM_LABELS, SIGHTINGS_LABELS } from '../constants';
import { type Sighting } from '../types';
import { formatCoordinates, getMapsUrl } from './format-sighting';

/** A partir de este largo la descripción se recorta a unas líneas con "Ver más". */
const LONG_REMARKS_LENGTH = 220;
const COLLAPSED_LINES = 4;

export type SightingDetailsProps = Pick<
  Sighting,
  'remarks' | 'kingdom' | 'vernacularName' | 'location'
>;

/**
 * Datos de un reporte bajo la foto (HU-20 CA1): reino y clasificación, descripción y lugar. Lo
 * comparten el foro y la cola de moderación.
 */
export function SightingDetails({
  remarks,
  kingdom,
  vernacularName,
  location,
}: SightingDetailsProps) {
  const theme = useTheme();
  const isLong = remarks.length > LONG_REMARKS_LENGTH;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: theme.primarySoft }]}>
          <ThemedText type="captionBold" themeColor="primary">
            {KINGDOM_LABELS[kingdom]}
          </ThemedText>
        </View>
        <View style={[styles.tag, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="captionBold" themeColor="textSecondary" numberOfLines={1}>
            {vernacularName ?? SIGHTINGS_LABELS.unknownClassification}
          </ThemedText>
        </View>
      </View>

      <ThemedText
        style={styles.remarks}
        themeColor="textSecondary"
        numberOfLines={isLong && !isExpanded ? COLLAPSED_LINES : undefined}>
        {remarks}
      </ThemedText>
      {isLong && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsExpanded((expanded) => !expanded)}
          hitSlop={Spacing.two}
          style={styles.toggle}>
          <ThemedText type="captionBold" themeColor="textMuted">
            {isExpanded ? SIGHTINGS_LABELS.showLess : SIGHTINGS_LABELS.showMore}
          </ThemedText>
        </Pressable>
      )}

      {location && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${SIGHTINGS_LABELS.openLocation}: ${formatCoordinates(location)}`}
          onPress={() => void Linking.openURL(getMapsUrl(location))}
          hitSlop={Spacing.two}
          style={styles.location}>
          <Icon name="location" size={14} color="textMuted" />
          <ThemedText style={styles.locationText} themeColor="textMuted">
            {formatCoordinates(location)}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tag: {
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
  },
  remarks: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  toggle: {
    alignSelf: 'flex-start',
    marginTop: -Spacing.one,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
  },
  locationText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
});
