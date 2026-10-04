// En web no existe SecureStore: se usa localStorage como respaldo (ADR-0006, web no es prioritaria).

/** Lee un valor de `localStorage` (respaldo web del almacenamiento seguro). */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    // localStorage puede lanzar en modo privado o con el almacenamiento bloqueado: se trata como vacío.
    return null;
  }
}

/** Guarda un valor en `localStorage` (respaldo web del almacenamiento seguro). */
export async function setSecureItem(key: string, value: string): Promise<void> {
  globalThis.localStorage?.setItem(key, value);
}

/** Elimina un valor de `localStorage` (respaldo web del almacenamiento seguro). */
export async function deleteSecureItem(key: string): Promise<void> {
  globalThis.localStorage?.removeItem(key);
}
