import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SPECIES_LABELS, type CategoryFilter } from '../constants';
import { useSpeciesList } from '../hooks';
import { type Species } from '../types';
import { CategoryChips } from './category-chips';
import { SpeciesCard } from './species-card';

/**
 * Pestaña "Inicio": listado de fichas taxonómicas por categoría (HU-10). Sin búsqueda hasta que la
 * API la implemente. Los chips filtran en el servidor (`?categoria=`).
 */
export function SpeciesListScreen() {
  const theme = useTheme();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const { data, isPending, isError, fetchStatus, refetch } = useSpeciesList(category);
  // HU-21: sin conexión la query queda en pausa; si no hay copia guardada se muestra el CA2.
  const offlineWithoutData = data === undefined && fetchStatus === 'paused';
  // Con datos guardados se siguen mostrando aunque falle el refresco.
  const showError = isError && data === undefined;

  const openDetail = (species: Species) => {
    router.push({ pathname: '/species/[id]', params: { id: species.id } });
  };

  return (
    <Screen>
      <View style={styles.filters}>
        <CategoryChips value={category} onChange={setCategory} />
      </View>

      {offlineWithoutData && (
        <EmptyState icon="wetland" title={SPECIES_LABELS.offlineUnavailable}>
          <Button label={SPECIES_LABELS.retry} onPress={() => void refetch()} />
        </EmptyState>
      )}

      {isPending && !offlineWithoutData && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      )}

      {showError && (
        <EmptyState icon="wetland" title={SPECIES_LABELS.loadError}>
          <Button label={SPECIES_LABELS.retry} onPress={() => void refetch()} />
        </EmptyState>
      )}

      {data !== undefined && data.length === 0 && (
        <EmptyState
          icon="wetland"
          title={
            category === 'all' ? SPECIES_LABELS.noSpeciesAtAll : SPECIES_LABELS.noSpeciesInCategory
          }
        />
      )}

      {data !== undefined && data.length > 0 && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SpeciesCard species={item} onPress={openDetail} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  separator: {
    height: 12,
  },
});
