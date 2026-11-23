import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useOfflineFilesVersion } from '@/hooks/use-offline-sync-status';
import { getOfflineFileUri } from '@/lib/offline';

import { type Species, type SpeciesCatalog } from '../types';
import { speciesCatalogQueryOptions } from './species-offline';
import {
  getSpeciesOfflineState,
  summarizeSpeciesOffline,
  type SpeciesOfflineState,
} from '../utils/species-catalog';

const hasFile = (url: string) => getOfflineFileUri(url) !== null;

/**
 * HU-21: si la ficha está completa en el dispositivo (texto y todas sus fotos). Se recalcula cuando cambian
 * los archivos descargados.
 */
export function useSpeciesOfflineState(species: Species): SpeciesOfflineState {
  const filesVersion = useOfflineFilesVersion();
  return useMemo(
    () => getSpeciesOfflineState(species, hasFile),
    // `filesVersion` obliga a volver a mirar el disco cuando terminan las descargas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [species, filesVersion],
  );
}

/**
 * HU-21: resumen de la copia local de fichas para la pantalla "Contenido sin conexión". Solo lee la copia
 * guardada: no lanza la sincronización. `undefined` si aún no hay copia.
 */
export function useSpeciesOfflineSummary(): { total: number; complete: number } | undefined {
  const queryClient = useQueryClient();
  const filesVersion = useOfflineFilesVersion();
  const select = useCallback(
    (catalog: SpeciesCatalog) => summarizeSpeciesOffline(catalog.species, hasFile),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filesVersion],
  );
  const { data } = useQuery({ ...speciesCatalogQueryOptions(queryClient), select, enabled: false });
  return data;
}
