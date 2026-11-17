// API pública de la infraestructura offline (HE-08, ADR-0017). Guía de uso: docs/architecture/OFFLINE.md.
export { type NetworkStatus, toNetworkStatus } from './network-state';
export { connectOnlineManager } from './online-manager';
export {
  getOfflineJson,
  keyValueStorage,
  removeOfflineItem,
  setOfflineJson,
  type KeyValueStorage,
} from './offline-storage';
export {
  OFFLINE_CACHE_BUSTER,
  OFFLINE_CACHE_MAX_AGE_MS,
  isPersistedQuery,
  offlineQueryOptions,
  queryPersistOptions,
  queryPersister,
  registerOfflineQueries,
  shouldPersistQuery,
} from './query-persistence';
export {
  DEFAULT_OFFLINE_FOLDER,
  clearOfflineFiles,
  downloadOfflineFiles,
  getOfflineFileUri,
  offlineFileName,
  pruneOfflineFiles,
  removeLocalFile,
  storeLocalFile,
  type OfflineDownloadOptions,
  type OfflineDownloadSummary,
} from './offline-files';
export { type OfflineSource } from './offline-source';
