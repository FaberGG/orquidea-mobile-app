import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import { listApprovedSightings, listPendingSightings } from '../api';
import { sightingsKeys } from '../constants';
import { type Sighting, type SightingPage } from '../types';

function getNextPage(lastPage: SightingPage): number | undefined {
  return lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined;
}

function flattenPages(data: InfiniteData<SightingPage, number>): Sighting[] {
  return data.pages.flatMap((page) => page.items);
}

/** HU-20: foro de avistamientos aprobados, paginado (scroll infinito). Público. */
export function useApprovedSightings() {
  return useInfiniteQuery({
    queryKey: sightingsKeys.approved(),
    queryFn: ({ pageParam }) => listApprovedSightings(pageParam),
    initialPageParam: 0,
    getNextPageParam: getNextPage,
    select: flattenPages,
  });
}

/** HU-19: cola de revisión (admin+). Se monta solo en la vista de moderación. */
export function usePendingSightings() {
  return useInfiniteQuery({
    queryKey: sightingsKeys.pending(),
    queryFn: ({ pageParam }) => listPendingSightings(pageParam),
    initialPageParam: 0,
    getNextPageParam: getNextPage,
    select: flattenPages,
  });
}
