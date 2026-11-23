import { getOfflineJson, setOfflineJson } from './offline-storage';

/** Fase de la sincronización de la copia offline (HU-21). */
export type OfflineSyncPhase = 'idle' | 'syncing' | 'done' | 'failed';

export type OfflineSyncStatus = {
  phase: OfflineSyncPhase;
  /** Archivos que faltaban al empezar la corrida actual y cuántos ya se procesaron. */
  files: { done: number; total: number };
  /** Archivos nuevos guardados en la última corrida. */
  downloaded: number;
  /** Fin de la última sincronización sin fallos (ms desde epoch), o `null` si nunca terminó una. */
  lastSuccessAt: number | null;
  /** Sube cada vez que cambian los archivos en disco: quien calcula "qué está descargado" lo recalcula. */
  filesVersion: number;
};

const LAST_SUCCESS_KEY = 'offline-sync:last-success-at';

const INITIAL: OfflineSyncStatus = {
  phase: 'idle',
  files: { done: 0, total: 0 },
  downloaded: 0,
  lastSuccessAt: null,
  filesVersion: 0,
};

let status: OfflineSyncStatus = INITIAL;
const listeners = new Set<() => void>();
let runner: (() => void) | null = null;

/** Estado actual. Es inmutable: cambia de referencia solo cuando cambia algo. */
export function getOfflineSyncStatus(): OfflineSyncStatus {
  return status;
}

export function subscribeOfflineSyncStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Actualiza el estado (lo usa `syncOfflineSources`). */
export function updateOfflineSyncStatus(changes: Partial<OfflineSyncStatus>): void {
  status = { ...status, ...changes };
  for (const listener of listeners) listener();
}

/** Marca que los archivos en disco cambiaron. */
export function bumpOfflineFilesVersion(): void {
  updateOfflineSyncStatus({ filesVersion: status.filesVersion + 1 });
}

/** Guarda la hora de la última sincronización completa, para mostrarla tras reiniciar la app. */
export async function saveOfflineSyncSuccess(at: number): Promise<void> {
  updateOfflineSyncStatus({ lastSuccessAt: at });
  try {
    await setOfflineJson(LAST_SUCCESS_KEY, at);
  } catch {
    // Solo es informativo: si no se guarda, se muestra tras la próxima sincronización.
  }
}

/** Lee la hora de la última sincronización completa guardada. Se llama una vez al iniciar. */
export async function loadOfflineSyncSuccess(): Promise<void> {
  const saved = await getOfflineJson<number>(LAST_SUCCESS_KEY);
  if (typeof saved === 'number' && status.lastSuccessAt === null) {
    updateOfflineSyncStatus({ lastSuccessAt: saved });
  }
}

/**
 * Registra quién ejecuta la sincronización (el componente `OfflineSync`) para que otras pantallas puedan
 * pedirla con `requestOfflineSync` sin duplicar la lógica. Devuelve la función para quitar el registro.
 */
export function setOfflineSyncRunner(run: () => void): () => void {
  runner = run;
  return () => {
    if (runner === run) runner = null;
  };
}

/** Pide una sincronización ahora (p. ej. el botón "Actualizar ahora"). No hace nada si no hay quien la ejecute. */
export function requestOfflineSync(): void {
  runner?.();
}

/** Solo para pruebas: vuelve al estado inicial. */
export function resetOfflineSyncStatus(): void {
  status = INITIAL;
  runner = null;
  for (const listener of listeners) listener();
}
