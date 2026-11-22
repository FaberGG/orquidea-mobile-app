import { useIsRestoring, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { type NetworkStatus, useNetworkStatus } from '@/hooks/use-network-status';
import {
  getOfflineSyncStatus,
  isBackendUnreachable,
  loadOfflineSyncSuccess,
  setOfflineSyncRunner,
} from '@/lib/offline';

import { OFFLINE_RECONNECT_SETTLE_MS, OFFLINE_RESYNC_INTERVAL_MS } from '../constants';
import { syncOfflineSources } from '../sync-offline-sources';

/**
 * HU-21: mantiene actualizada la copia offline. Sin interfaz (el avance se publica en `offline-sync-status`).
 * Sincroniza las fuentes de `OFFLINE_SOURCES`:
 * - al abrir la app (tras restaurar la caché guardada);
 * - al reconectar, cuando la red lleva `OFFLINE_RECONNECT_SETTLE_MS` estable (una red que parpadea no lanza
 *   varias sincronizaciones);
 * - al volver a primer plano, si la última sincronización buena es vieja o el backend no respondía;
 * - cuando otra pantalla lo pide con `requestOfflineSync` (p. ej. "Actualizar ahora").
 *
 * Sin red confirmada no hace nada, cancela la corrida en curso al perder la red y nunca solapa dos corridas:
 * si llega un pedido mientras corre una, se repite al terminar.
 */
export function OfflineSync() {
  const queryClient = useQueryClient();
  const { status, refresh } = useNetworkStatus();
  const isRestoring = useIsRestoring();
  const statusRef = useRef<NetworkStatus>(status);
  const previousStatus = useRef<NetworkStatus | null>(null);
  const running = useRef(false);
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  // Para repetir la sincronización desde su propio `finally` sin que `start` se refiera a sí misma.
  const startRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearSettle = useCallback(() => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = null;
  }, []);

  const start = useCallback(() => {
    if (statusRef.current === 'offline' || !mounted.current) return;
    if (running.current) {
      pending.current = true;
      return;
    }
    running.current = true;
    pending.current = false;
    controller.current = new AbortController();
    syncOfflineSources(queryClient, { signal: controller.current.signal })
      .catch(() => {
        // Se reintenta en la siguiente reconexión, al volver a la app o al pedirlo.
      })
      .finally(() => {
        running.current = false;
        if (pending.current) startRef.current();
      });
  }, [queryClient]);

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  const startAfterSettle = useCallback(() => {
    clearSettle();
    settleTimer.current = setTimeout(() => {
      settleTimer.current = null;
      start();
    }, OFFLINE_RECONNECT_SETTLE_MS);
  }, [clearSettle, start]);

  useEffect(() => {
    mounted.current = true;
    void loadOfflineSyncSuccess().catch(() => undefined);
    return () => {
      mounted.current = false;
      clearSettle();
      controller.current?.abort();
    };
  }, [clearSettle]);

  useEffect(() => {
    if (isRestoring) return;
    return setOfflineSyncRunner(() => {
      clearSettle();
      start();
    });
  }, [clearSettle, isRestoring, start]);

  useEffect(() => {
    if (isRestoring) return;
    const previous = previousStatus.current;
    previousStatus.current = status;
    if (status === 'offline') {
      clearSettle();
      pending.current = false;
      controller.current?.abort();
      return;
    }
    // Al montar sincroniza enseguida; pasar de `unknown` a `online` no repite la sincronización.
    if (previous === null) start();
    else if (previous === 'offline') startAfterSettle();
  }, [clearSettle, isRestoring, start, startAfterSettle, status]);

  useEffect(() => {
    if (isRestoring) return;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next !== 'active') return;
      // Los avisos de red pueden perderse en segundo plano: se vuelve a leer antes de decidir.
      void refresh().then((current) => {
        if (current === 'offline') return;
        const { lastSuccessAt } = getOfflineSyncStatus();
        const stale =
          lastSuccessAt === null || Date.now() - lastSuccessAt > OFFLINE_RESYNC_INTERVAL_MS;
        if (stale || isBackendUnreachable()) startAfterSettle();
      });
    });
    return () => subscription.remove();
  }, [isRestoring, refresh, startAfterSettle]);

  return null;
}
