import { useMutation } from '@tanstack/react-query';

import { requestPasswordReset } from '../api';

/**
 * HU-1.1 paso 1: solicita el código de 6 dígitos. Quien lo usa decide a dónde ir al terminar
 * (la primera vez se pasa al paso 2; al reenviar se queda en la misma pantalla).
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset({ email }),
  });
}
