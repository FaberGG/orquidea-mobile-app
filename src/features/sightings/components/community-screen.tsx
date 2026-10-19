import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { Spacing } from '@/constants/theme';
import { Can, usePermission } from '@/permissions';

import { SIGHTINGS_LABELS, SIGHTINGS_MESSAGES } from '../constants';
import { useApprovedSightings, usePendingSightings } from '../hooks';
import { type CommunityView, CommunityTabs } from './community-tabs';
import { NewSightingFab } from './new-sighting-fab';
import { PendingSightingCard } from './pending-sighting-card';
import { SightingPost } from './sighting-post';
import { SightingsList } from './sightings-list';

/**
 * Pestaña "Comunidad" (HE-07). Todos los roles ven el foro de avistamientos aprobados (HU-20); quien
 * puede revisar reportes ve además la pestaña "Moderación" con la cola de pendientes (HU-19). El botón
 * flotante lleva al formulario de HU-18 o pide iniciar sesión.
 */
export function CommunityScreen() {
  const canReview = usePermission('sightings:review');
  const [view, setView] = useState<CommunityView>('feed');
  // Si el rol cambia (p. ej. se cierra sesión) la vista de moderación deja de existir.
  const activeView = canReview ? view : 'feed';

  return (
    <Screen>
      <Can permission="sightings:review">
        <View style={styles.tabs}>
          <CommunityTabs value={activeView} onChange={setView} />
        </View>
      </Can>

      {activeView === 'feed' ? <ApprovedFeed /> : <ModerationQueue />}

      <NewSightingFab />
    </Screen>
  );
}

function ApprovedFeed() {
  const query = useApprovedSightings();
  return (
    <SightingsList
      data={query.data}
      isPending={query.isPending}
      isError={query.isError}
      isRefetching={query.isRefetching}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      onRefresh={() => void query.refetch()}
      onEndReached={() => void query.fetchNextPage()}
      renderItem={(sighting) => <SightingPost sighting={sighting} />}
      empty={{ title: SIGHTINGS_MESSAGES.noApprovedSightings }}
      separator="line"
      horizontalPadding={0}
    />
  );
}

function ModerationQueue() {
  const query = usePendingSightings();
  return (
    <SightingsList
      data={query.data}
      isPending={query.isPending}
      isError={query.isError}
      isRefetching={query.isRefetching}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      onRefresh={() => void query.refetch()}
      onEndReached={() => void query.fetchNextPage()}
      renderItem={(sighting) => <PendingSightingCard sighting={sighting} />}
      empty={{
        title: SIGHTINGS_LABELS.noPendingTitle,
        description: SIGHTINGS_LABELS.noPendingDescription,
      }}
      separator="gap"
      horizontalPadding={Spacing.three}
    />
  );
}

const styles = StyleSheet.create({
  tabs: {
    paddingBottom: Spacing.two,
  },
});
