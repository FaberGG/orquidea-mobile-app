import { useEffect, useRef } from 'react';

import { useToast } from '@/components/feedback/toast';
import { type Connectivity, useConnectivity } from '@/hooks/use-connectivity';
import { useOfflineSyncStatus } from '@/hooks/use-offline-sync-status';

import { OFFLINE_MESSAGES, OFFLINE_RECONNECT_SETTLE_MS } from '../constants';

/**
 * HU-21: aviso general (toast) de los cambios de conexión. Sin interfaz propia.
 * - Al quedarse sin conexión (o al abrir la app sin ella): "Sin conexión…".
 * - Al recuperarla: "Conexión restablecida. Actualizando contenido…".
 * - Al terminar una sincronización que guardó archivos nuevos: "Contenido actualizado…".
 *
 * Solo avisa cuando el estado lleva `OFFLINE_RECONNECT_SETTLE_MS` estable: una red que parpadea no genera
 * avisos. Mientras el estado es desconocido no avisa, y abrir la app con conexión tampoco.
 */
export function ConnectivityNotice() {
  const connectivity = useConnectivity();
  const { phase, downloaded } = useOfflineSyncStatus();
  const { show } = useToast();
  const announced = useRef<Exclude<Connectivity, 'unknown'> | null>(null);
  const previousPhase = useRef(phase);

  useEffect(() => {
    if (connectivity === 'unknown') return;
    const timer = setTimeout(() => {
      const last = announced.current;
      announced.current = connectivity;
      if (last === connectivity) return;
      if (connectivity === 'offline') show(OFFLINE_MESSAGES.offline, 'info');
      else if (last !== null) show(OFFLINE_MESSAGES.reconnected, 'info');
    }, OFFLINE_RECONNECT_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [connectivity, show]);

  useEffect(() => {
    const finished = previousPhase.current === 'syncing' && phase === 'done';
    previousPhase.current = phase;
    if (finished && downloaded > 0) show(OFFLINE_MESSAGES.updated, 'info');
  }, [downloaded, phase, show]);

  return null;
}
