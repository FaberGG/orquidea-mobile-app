import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { useSession } from '@/features/auth';
import { useNetworkStatus } from '@/hooks/use-network-status';

import { SIGHTINGS_MESSAGES, sightingsKeys } from '../constants';
import { useSightingQueueState } from '../hooks';
import { syncSightingQueue, type SightingQueueSyncResult } from '../queue';

type SightingQueueSyncProps = {
  /** Aviso al terminar. Por defecto, un diálogo del sistema (se reemplaza en pruebas). */
  notify?: (message: string) => void;
};

function showAlert(message: string) {
  Alert.alert(message);
}

/** Texto del aviso al terminar (CA2), o `null` si no hay nada que avisar. */
export function getSyncNotice(result: SightingQueueSyncResult): string | null {
  if (result.failed > 0) return SIGHTINGS_MESSAGES.syncedWithFailures;
  if (result.sent > 0) return SIGHTINGS_MESSAGES.synced;
  return null;
}

/**
 * HU-22 CA2: envía sola la cola de reportes sin conexión. Sin interfaz. Sincroniza cuando hay sesión,
 * la red no está confirmada como caída y el usuario tiene reportes pendientes: al abrir la app, al
 * volver la señal, al iniciar sesión de nuevo, al guardar uno nuevo o al pulsar REINTENTAR.
 */
export function SightingQueueSync({ notify = showAlert }: SightingQueueSyncProps) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSession();
  const { status } = useNetworkStatus();
  const { items, syncRequest } = useSightingQueueState();
  const ownerId = isAuthenticated ? user?.id : undefined;
  const hasPending = items.some((item) => item.ownerId === ownerId && item.status !== 'failed');
  // Enviar cambia la cola (y con ella `hasPending`): estas marcas evitan avisar dos veces o callar el aviso.
  const running = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!ownerId || status === 'offline' || !hasPending || running.current) return;
    running.current = true;
    void syncSightingQueue(ownerId)
      .then((result) => {
        if (result.sent > 0) {
          void queryClient.invalidateQueries({ queryKey: sightingsKeys.pending() });
        }
        const notice = getSyncNotice(result);
        if (mounted.current && notice) notify(notice);
      })
      .finally(() => {
        running.current = false;
      });
  }, [hasPending, notify, ownerId, queryClient, status, syncRequest]);

  return null;
}
