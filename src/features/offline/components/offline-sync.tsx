import { useIsRestoring, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { type NetworkStatus, useNetworkStatus } from '@/hooks/use-network-status';

import { syncOfflineSources } from '../sync-offline-sources';

/**
 * HU-21: mantiene actualizada la copia offline. Sin interfaz: al abrir la app y cada vez que vuelve la
 * conexión (paso de `offline` a otro estado) descarga los datos y fotos de las fuentes de `OFFLINE_SOURCES`.
 * Sin red confirmada no hace nada y nunca solapa dos sincronizaciones.
 */
export function OfflineSync() {
  const queryClient = useQueryClient();
  const { status } = useNetworkStatus();
  // Espera a que `PersistQueryClientProvider` restaure la caché guardada antes de sincronizar.
  const isRestoring = useIsRestoring();
  const previousStatus = useRef<NetworkStatus | null>(null);
  const running = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isRestoring) return;
    const previous = previousStatus.current;
    previousStatus.current = status;
    if (status === 'offline' || running.current) return;
    // Solo al montar o al reconectar: pasar de `unknown` a `online` no repite la sincronización.
    if (previous !== null && previous !== 'offline') return;

    running.current = true;
    controller.current = new AbortController();
    syncOfflineSources(queryClient, { signal: controller.current.signal })
      .catch(() => {
        // Se reintenta en la siguiente reconexión o al volver a abrir la app.
      })
      .finally(() => {
        running.current = false;
      });
  }, [isRestoring, queryClient, status]);

  useEffect(() => () => controller.current?.abort(), []);

  return null;
}
