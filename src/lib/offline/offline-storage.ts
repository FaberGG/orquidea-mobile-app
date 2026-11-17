import Storage from 'expo-sqlite/kv-store';

import { type KeyValueStorage } from './key-value-storage.types';

export type { KeyValueStorage } from './key-value-storage.types';

/**
 * Almacenamiento clave-valor persistente y **no cifrado** (`expo-sqlite/kv-store`, ADR-0017). Para datos
 * públicos o del propio dispositivo: caché offline, cola de envíos pendientes. Los secretos van en
 * `@/lib/storage` (SecureStore).
 */
export const keyValueStorage: KeyValueStorage = {
  getItem: (key) => Storage.getItemAsync(key),
  setItem: (key, value) => Storage.setItemAsync(key, value),
  removeItem: async (key) => {
    await Storage.removeItemAsync(key);
  },
};

/** Lee y parsea un valor JSON. Devuelve `null` si no existe o si está corrupto. */
export async function getOfflineJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await keyValueStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

/** Guarda un valor serializable como JSON. */
export async function setOfflineJson(key: string, value: unknown): Promise<void> {
  await keyValueStorage.setItem(key, JSON.stringify(value));
}

/** Borra un valor guardado. */
export async function removeOfflineItem(key: string): Promise<void> {
  await keyValueStorage.removeItem(key);
}
