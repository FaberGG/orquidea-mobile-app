import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { isSessionDependentQuery } from './session-queries';
import { useSession } from './use-session';

/**
 * HU-3: cierra la sesión. No hay endpoint de logout: se borra el token, se limpia la caché de
 * servidor (datos que pudieran depender del rol, salvo los públicos guardados para HU-21) y se
 * vuelve al inicio como visitante (CA1).
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { signOut } = useSession();

  return async () => {
    await signOut();
    // Se conserva la entrada de sesión (ya en `null`) para no volver a "cargando" ni mostrar la splash.
    // Las fichas guardadas para uso offline (HU-21) se conservan.
    queryClient.removeQueries({ predicate: isSessionDependentQuery });
    router.replace('/');
  };
}
