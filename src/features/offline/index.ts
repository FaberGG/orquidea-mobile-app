// API pública de la feature offline (HE-08). Guía: docs/architecture/OFFLINE.md.
export { OfflineSync } from './components/offline-sync';
export { configureOfflineQueries } from './configure-offline-queries';
export { OFFLINE_SOURCES } from './constants';
export { syncOfflineSources, type OfflineSyncResult } from './sync-offline-sources';
