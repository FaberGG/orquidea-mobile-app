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

/** Espera con la red estable antes de sincronizar o avisar, para que un parpadeo no dispare dos veces. */
export const OFFLINE_RECONNECT_SETTLE_MS = 2_000;

/** Al volver a primer plano se sincroniza de nuevo si la última sincronización buena es más vieja que esto. */
export const OFFLINE_RESYNC_INTERVAL_MS = 10 * 60_000;

/**
 * Avisos generales de conexión (HU-21). HU-21 solo fija el mensaje del CA2 (en `features/species`).
 * Respaldo local, pendiente de aprobar en HU-21.
 */
export const OFFLINE_MESSAGES = {
  offline: 'Sin conexión. Puedes seguir consultando el contenido descargado.',
  reconnected: 'Conexión restablecida. Actualizando contenido…',
  updated: 'Contenido actualizado para usar sin conexión.',
} as const;

/**
 * Pantalla "Contenido sin conexión" (menú lateral).
 * Respaldo local, pendiente de aprobar en HU-21.
 */
export const OFFLINE_CONTENT_LABELS = {
  title: 'Contenido sin conexión',
  intro:
    'La app guarda las fichas y estaciones en este dispositivo cuando hay conexión, para que puedas consultarlas durante el recorrido.',
  statusTitle: 'Estado',
  statusOffline: 'Sin conexión. Se muestra el contenido descargado.',
  statusSyncing: 'Actualizando contenido…',
  statusProgress: (done: number, total: number) => `Descargando fotos… ${done}/${total}`,
  statusFailed: 'No se pudo completar la última actualización. Se reintentará al reconectar.',
  statusNever: 'Aún no se ha descargado contenido.',
  lastUpdated: (date: string) => `Actualizado el ${date}`,
  updateNow: 'ACTUALIZAR AHORA',
  speciesTitle: 'Fichas taxonómicas',
  speciesSummary: (complete: number, total: number) =>
    `${complete} de ${total} fichas descargadas con sus fotos`,
  speciesEmpty: 'Aún no hay fichas descargadas.',
  speciesOpen: 'Ver fichas',
  stationsTitle: 'Estaciones del sendero',
  stationsSummary: (count: number) =>
    count === 1 ? '1 estación guardada' : `${count} estaciones guardadas`,
  stationsEmpty: 'Aún no hay estaciones descargadas.',
  stationsOpen: 'Ver estaciones',
  mapTitle: 'Mapa del sendero',
  // SCRUM-84. Respaldo local, pendiente de aprobar en HU-21.
  mapIncluded:
    'El mapa base de Popayán viene incluido en la app: sin conexión el mapa lo usa automáticamente.',
  back: 'Volver',
} as const;
