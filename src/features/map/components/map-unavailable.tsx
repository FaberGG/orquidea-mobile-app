import { type ReactNode } from 'react';

import { EmptyState } from '@/components/feedback/empty-state';

import { MAP_LABELS } from '../constants';

/**
 * Reemplaza al mapa cuando no se puede montar de forma segura (p. ej. Android sin API key de Google).
 * Ver `isNativeMapAvailable`: el fallo del SDK es nativo y no se puede atrapar con un error boundary.
 */
export function MapUnavailable({ children }: { children?: ReactNode }) {
  return (
    <EmptyState
      icon="map"
      title={MAP_LABELS.unavailableTitle}
      description={MAP_LABELS.unavailableDescription}>
      {children}
    </EmptyState>
  );
}
