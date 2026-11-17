import { stationsOfflineSource } from '@/features/map';
import { speciesOfflineSource } from '@/features/species';
import { type OfflineSource } from '@/lib/offline';

/**
 * Fuentes que se guardan en el dispositivo para uso sin conexión (HU-21). Para agregar una (p. ej. el mapa en
 * SCRUM-68): exportar un `OfflineSource` desde el `index.ts` de su feature y añadirlo aquí.
 */
export const OFFLINE_SOURCES: readonly OfflineSource[] = [
  speciesOfflineSource,
  stationsOfflineSource,
];
