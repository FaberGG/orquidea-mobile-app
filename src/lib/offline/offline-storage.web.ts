// En web se usa localStorage (ADR-0006: la web no es prioritaria) y se evita cargar SQLite en el navegador.
import { type KeyValueStorage } from './key-value-storage.types';

export type { KeyValueStorage } from './key-value-storage.types';

function local(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

/** Respaldo web de `keyValueStorage`. */
export const keyValueStorage: KeyValueStorage = {
  getItem: async (key) => local()?.getItem(key) ?? null,
  setItem: async (key, value) => {
    local()?.setItem(key, value);
  },
  removeItem: async (key) => {
    local()?.removeItem(key);
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
