import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Spacing } from '@/constants/theme';
import { useSpeciesList } from '@/features/species';
import { useTheme } from '@/hooks/use-theme';

import { STATION_LABELS, STATION_MESSAGES } from '../constants';

export type StationSpeciesPickerProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

/**
 * Selector múltiple de fichas taxonómicas (HU-13 CA4). Lista todas las fichas publicadas
 * (`GET /api/fichas-taxonomicas`, sin categoría) con una casilla por ficha.
 */
export function StationSpeciesPicker({ value, onChange }: StationSpeciesPickerProps) {
  const { data, isPending, isError, refetch } = useSpeciesList('all');
  const theme = useTheme();

  if (isPending) return <ActivityIndicator color={theme.primary} />;
  if (isError) {
    return (
      <View style={styles.group}>
        <ThemedText type="small" themeColor="textSecondary">
          {STATION_MESSAGES.speciesLoadError}
        </ThemedText>
        <Button label={STATION_LABELS.retry} variant="link" onPress={() => void refetch()} />
      </View>
    );
  }
  if (data.length === 0) {
    return (
      <ThemedText type="small" themeColor="textMuted">
        {STATION_MESSAGES.speciesEmpty}
      </ThemedText>
    );
  }

  const toggle = (id: string, isChecked: boolean) =>
    onChange(isChecked ? [...value, id] : value.filter((item) => item !== id));

  return (
    <View style={styles.group}>
      <ThemedText type="captionBold" themeColor="textSecondary">
        {STATION_LABELS.speciesSelected(value.length)}
      </ThemedText>
      {data.map((species) => (
        <Checkbox
          key={species.id}
          isChecked={value.includes(species.id)}
          onChange={(isChecked) => toggle(species.id, isChecked)}
          accessibilityLabel={species.vernacularName}>
          <ThemedText type="small" themeColor="textLabel">
            {species.vernacularName}
          </ThemedText>
          <ThemedText type="caption" themeColor="textMuted" style={styles.italic}>
            {species.scientificName}
          </ThemedText>
        </Checkbox>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  italic: {
    fontStyle: 'italic',
  },
});
