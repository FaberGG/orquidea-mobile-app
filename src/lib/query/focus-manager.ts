import { focusManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

let connected = false;

/**
 * Conecta el `focusManager` de TanStack Query con `AppState`: al volver la app al primer plano, las queries
 * activas con datos vencidos se refrescan (en web lo hace el propio navegador con `visibilitychange`).
 *
 * Idempotente: llamarla varias veces no registra listeners duplicados.
 */
export function connectFocusManager(): void {
  if (connected || Platform.OS === 'web') return;
  connected = true;
  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener('change', (state) => {
      setFocused(state === 'active');
    });
    return () => subscription.remove();
  });
}
