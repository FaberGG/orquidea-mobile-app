import { randomUUID } from 'expo-crypto';

import { getOfflineJson, removeLocalFile, setOfflineJson, storeLocalFile } from '@/lib/offline';

import { type SightingInput } from '../types';

/**
 * Estado de un reporte guardado sin conexión (HU-22):
 * - `pending`: "pendiente de sincronización" (CA1); se envía al volver la señal.
 * - `failed`: la API lo rechazó con un `4xx` (p. ej. foto inválida). No se reintenta solo.
 * - `needs-login`: la sesión venció mientras esperaba; se envía al volver a iniciar sesión.
 */
export type QueuedSightingStatus = 'pending' | 'failed' | 'needs-login';

export type QueuedSighting = {
  /** UUID generado en el teléfono. Viaja como `id` para que el back no lo duplique (SCRUM-66). */
  id: string;
  /** Usuario que lo creó: solo él lo ve y solo con su sesión se envía. */
  ownerId: string;
  /** Fecha en que se guardó (ISO-8601). */
  createdAt: string;
  /** Datos del reporte. La foto apunta a la copia guardada en la carpeta de la app. */
  input: SightingInput;
  status: QueuedSightingStatus;
  /** Motivo del rechazo (`failed`), tal como lo da la API. */
  errorMessage: string | null;
};

export type SightingQueueState = {
  items: readonly QueuedSighting[];
  /** Sube cada vez que alguien pide sincronizar ya (botón REINTENTAR). */
  syncRequest: number;
};

/** Clave del kv-store (no cifrado: no se guarda el token ni datos sensibles, OFFLINE.md §5). */
export const SIGHTING_QUEUE_KEY = 'orquidea.sightings-queue';
/** Carpeta de `offline-files/` donde se copian las fotos de los reportes pendientes. */
export const SIGHTING_QUEUE_PHOTO_FOLDER = 'pending-sightings';

const MIME_EXTENSION: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png' };

let state: SightingQueueState = { items: [], syncRequest: 0 };
let loading: Promise<void> | null = null;
let writes: Promise<void> = Promise.resolve();
const listeners = new Set<() => void>();

function setState(next: SightingQueueState) {
  state = next;
  for (const listener of listeners) listener();
}

/** Suscripción para `useSyncExternalStore`. */
export function subscribeSightingQueue(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSightingQueueState(): SightingQueueState {
  return state;
}

/** Lee la cola guardada en el dispositivo (una sola vez por sesión de la app). */
export async function loadSightingQueue(): Promise<readonly QueuedSighting[]> {
  loading ??= getOfflineJson<QueuedSighting[]>(SIGHTING_QUEUE_KEY).then((saved) => {
    setState({ ...state, items: Array.isArray(saved) ? saved : [] });
  });
  await loading;
  return state.items;
}

/** Cambia la cola y la guarda. Las escrituras van en fila para no pisarse entre sí. */
async function updateQueue(
  change: (items: readonly QueuedSighting[]) => readonly QueuedSighting[],
): Promise<void> {
  await loadSightingQueue();
  const write = writes.then(async () => {
    setState({ ...state, items: change(state.items) });
    await setOfflineJson(SIGHTING_QUEUE_KEY, state.items);
  });
  // Un fallo al guardar no debe bloquear las escrituras siguientes.
  writes = write.catch(() => undefined);
  return write;
}

/**
 * HU-22 CA1: guarda el reporte en el dispositivo como "pendiente de sincronización". Copia la foto a
 * una carpeta propia: la URI del selector puede dejar de existir.
 */
export async function enqueueSighting(
  input: SightingInput,
  ownerId: string,
): Promise<QueuedSighting> {
  const id = randomUUID();
  const photo = input.photo
    ? {
        ...input.photo,
        uri: storeLocalFile(
          input.photo.uri,
          SIGHTING_QUEUE_PHOTO_FOLDER,
          `${id}.${MIME_EXTENSION[input.photo.mimeType] ?? 'jpg'}`,
        ),
      }
    : null;
  const item: QueuedSighting = {
    id,
    ownerId,
    createdAt: new Date().toISOString(),
    input: { ...input, photo },
    status: 'pending',
    errorMessage: null,
  };
  await updateQueue((items) => [...items, item]);
  return item;
}

/** Quita un reporte de la cola (enviado o descartado) y borra su foto guardada. */
export async function removeQueuedSighting(id: string): Promise<void> {
  const photoUri = state.items.find((item) => item.id === id)?.input.photo?.uri;
  await updateQueue((items) => items.filter((item) => item.id !== id));
  if (photoUri) removeLocalFile(photoUri);
}

export async function setQueuedSightingStatus(
  ids: readonly string[],
  status: QueuedSightingStatus,
  errorMessage: string | null = null,
): Promise<void> {
  await updateQueue((items) =>
    items.map((item) => (ids.includes(item.id) ? { ...item, status, errorMessage } : item)),
  );
}

/** REINTENTAR: vuelve a dejar el reporte pendiente y pide sincronizar ya. */
export async function retryQueuedSighting(id: string): Promise<void> {
  await setQueuedSightingStatus([id], 'pending');
  setState({ ...state, syncRequest: state.syncRequest + 1 });
}

/** Solo para pruebas: vacía el estado en memoria para que la siguiente lectura vuelva al kv-store. */
export function resetSightingQueueForTests(): void {
  loading = null;
  writes = Promise.resolve();
  state = { items: [], syncRequest: 0 };
}
