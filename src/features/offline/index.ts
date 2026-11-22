// API pública de la feature offline (HE-08). Guía: docs/architecture/OFFLINE.md.
export { ConnectivityNotice } from './components/connectivity-notice';
export { OfflineContentScreen } from './components/offline-content-screen';
export { OfflineSync } from './components/offline-sync';
export { configureOfflineQueries } from './configure-offline-queries';
export { OFFLINE_CONTENT_LABELS, OFFLINE_MESSAGES, OFFLINE_SOURCES } from './constants';
export { syncOfflineSources, type OfflineSyncResult } from './sync-offline-sources';
export { watchBackendReachability } from './watch-backend-reachability';
