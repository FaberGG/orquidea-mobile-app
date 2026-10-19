import { type ReactElement } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SIGHTINGS_LABELS } from '../constants';
import { type Sighting } from '../types';

/** Espacio bajo el último elemento para que el botón flotante no lo tape. */
const FAB_CLEARANCE = 96;

export type SightingsListProps = {
  data: Sighting[] | undefined;
  isPending: boolean;
  isError: boolean;
  isRefetching: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  renderItem: (sighting: Sighting) => ReactElement;
  empty: { title: string; description?: string };
  /** Separador entre elementos: línea de borde a borde (foro) o espacio (tarjetas). */
  separator: 'line' | 'gap';
  /** Margen lateral del contenido: 0 en el foro (fotos de borde a borde), 16 en tarjetas. */
  horizontalPadding: number;
};

/**
 * Lista paginada de reportes con los cuatro estados de CODIGO §5 (cargando, error, vacío, éxito),
 * deslizar para recargar y scroll infinito. La usan el foro (HU-20) y la cola de revisión (HU-19).
 */
export function SightingsList({
  data,
  isPending,
  isError,
  isRefetching,
  hasNextPage,
  isFetchingNextPage,
  onRefresh,
  onEndReached,
  renderItem,
  empty,
  separator,
  horizontalPadding,
}: SightingsListProps) {
  const theme = useTheme();

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (isError || data === undefined) {
    return (
      <EmptyState icon="community" title={SIGHTINGS_LABELS.loadError}>
        <Button label={SIGHTINGS_LABELS.retry} onPress={onRefresh} />
      </EmptyState>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => renderItem(item)}
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: horizontalPadding },
        data.length === 0 && styles.emptyContent,
      ]}
      ItemSeparatorComponent={() =>
        separator === 'line' ? (
          <View style={[styles.line, { backgroundColor: theme.border }]} />
        ) : (
          <View style={styles.gap} />
        )
      }
      ListEmptyComponent={
        <EmptyState icon="community" title={empty.title} description={empty.description} />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator
            style={styles.footer}
            color={theme.primary}
            accessibilityLabel={SIGHTINGS_LABELS.loadingMore}
          />
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isFetchingNextPage}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) onEndReached();
      }}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: FAB_CLEARANCE,
  },
  emptyContent: {
    flexGrow: 1,
  },
  line: {
    height: StyleSheet.hairlineWidth,
  },
  gap: {
    height: Spacing.three,
  },
  footer: {
    paddingVertical: Spacing.four,
  },
});
