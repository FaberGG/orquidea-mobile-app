import { isApiError } from '@/lib/api';

import { createSighting } from '../api';
import {
  loadSightingQueue,
  removeQueuedSighting,
  setQueuedSightingStatus,
  type QueuedSighting,
} from './sighting-queue';
import { getCreateSightingErrorMessage } from '../hooks/use-sighting-mutations';

export type SightingQueueSyncResult = {
  /** Reportes que la API aceptó (salen de la cola). */
  sent: number;
  /** Reportes que la API rechazó con un `4xx` (quedan como `failed`). */
  failed: number;
  /**
   * Por qué se detuvo antes de terminar: sin red (`network`), sesión vencida (`session`) o error del
   * servidor (`server`). `null` si recorrió toda la cola.
   */
  stoppedBy: 'network' | 'session' | 'server' | null;
};

type Send = (item: QueuedSighting) => Promise<unknown>;

const sendQueued: Send = (item) => createSighting(item.input, item.id);

let running: Promise<SightingQueueSyncResult> | null = null;

/**
 * HU-22 CA2: envía, de uno en uno y en el orden en que se guardaron, los reportes del usuario que
 * esperan sincronización. Un reporte solo sale de la cola cuando la API confirma que lo guardó.
 * - `4xx` (salvo `401`) → definitivo: queda `failed` con el mensaje de la API; se sigue con el resto.
 * - `401` → la sesión venció: este y los siguientes quedan `needs-login` y se para.
 * - Sin red, tiempo agotado o `5xx` → se para y se reintenta en la siguiente sincronización.
 * Nunca hay dos sincronizaciones a la vez: si ya hay una, devuelve esa.
 */
export function syncSightingQueue(
  ownerId: string,
  send: Send = sendQueued,
): Promise<SightingQueueSyncResult> {
  running ??= runSync(ownerId, send).finally(() => {
    running = null;
  });
  return running;
}

async function runSync(ownerId: string, send: Send): Promise<SightingQueueSyncResult> {
  const result: SightingQueueSyncResult = { sent: 0, failed: 0, stoppedBy: null };
  const queue = (await loadSightingQueue()).filter(
    (item) => item.ownerId === ownerId && item.status !== 'failed',
  );

  for (const [index, item] of queue.entries()) {
    try {
      await send(item);
      await removeQueuedSighting(item.id);
      result.sent += 1;
    } catch (error) {
      if (!isApiError(error) || error.kind !== 'http') {
        result.stoppedBy = 'network';
        break;
      }
      if (error.status === 401) {
        const waiting = queue.slice(index).map((queued) => queued.id);
        await setQueuedSightingStatus(waiting, 'needs-login');
        result.stoppedBy = 'session';
        break;
      }
      if (error.status >= 400 && error.status < 500) {
        await setQueuedSightingStatus([item.id], 'failed', getCreateSightingErrorMessage(error));
        result.failed += 1;
        continue;
      }
      result.stoppedBy = 'server';
      break;
    }
  }
  return result;
}
