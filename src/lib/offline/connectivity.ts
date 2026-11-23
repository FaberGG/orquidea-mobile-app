import { onlineManager } from '@tanstack/react-query';

import { type NetworkStatus } from './network-state';

/**
 * Conectividad efectiva para la interfaz (HU-21): combina la red del dispositivo con si el backend responde.
 * `expo-network` solo sabe si hay red; una petición que falla por red o por tiempo agotado significa que el
 * backend no está al alcance, y eso también cuenta como "sin conexión" para la interfaz.
 *
 * No pausa las queries: eso lo sigue decidiendo solo `expo-network` a través del `onlineManager` (ADR-0017).
 */
export type Connectivity = 'online' | 'offline' | 'unknown';

let networkStatus: NetworkStatus = 'unknown';
/** `null`: aún no se sabe (ninguna petición terminó desde el último cambio de red). */
let backendReachable: boolean | null = null;
const listeners = new Set<() => void>();

function compute(): Connectivity {
  if (!onlineManager.isOnline() || networkStatus === 'offline') return 'offline';
  if (backendReachable === false) return 'offline';
  if (networkStatus === 'online' || backendReachable === true) return 'online';
  return 'unknown';
}

/** Avisa a los suscriptores; `useSyncExternalStore` descarta los avisos que no cambian el valor. */
function emit(): void {
  for (const listener of listeners) listener();
}

/** Estado actual (un texto: estable entre llamadas mientras no cambie, apto para `useSyncExternalStore`). */
export function getConnectivity(): Connectivity {
  return compute();
}

/** Se suscribe a los cambios de conectividad. Devuelve la función para cancelar la suscripción. */
export function subscribeConnectivity(listener: () => void): () => void {
  listeners.add(listener);
  const unsubscribeOnline = onlineManager.subscribe(() => listener());
  return () => {
    listeners.delete(listener);
    unsubscribeOnline();
  };
}

/**
 * Informa el estado de la red del dispositivo (lo llama `connectOnlineManager`). Un cambio de red vuelve a
 * dejar en duda si el backend responde: la siguiente petición lo decide.
 */
export function setNetworkStatus(status: NetworkStatus): void {
  if (status !== networkStatus) backendReachable = null;
  networkStatus = status;
  emit();
}

/** Una petición recibió respuesta del backend (aunque sea un error HTTP). */
export function reportBackendReachable(): void {
  backendReachable = true;
  emit();
}

/** Una petición falló por red o por tiempo agotado: el backend no está al alcance. */
export function reportBackendUnreachable(): void {
  backendReachable = false;
  emit();
}

/** `true` si la última petición no llegó al backend. */
export function isBackendUnreachable(): boolean {
  return backendReachable === false;
}

/** Solo para pruebas: vuelve al estado inicial. */
export function resetConnectivity(): void {
  networkStatus = 'unknown';
  backendReachable = null;
  emit();
}
