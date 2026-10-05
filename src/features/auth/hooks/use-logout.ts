import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { authKeys } from '../constants';
import { useSession } from './use-session';

/**
 * HU-3: cierra la sesión. No hay endpoint de logout: se borra el token, se limpia la caché de
 * servidor (datos que pudieran depender del rol) y se vuelve al inicio como visitante (CA1).
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { signOut } = useSession();

  return async () => {
    await signOut();
    // Se conserva la entrada de sesión (ya en `null`) para no volver a "cargando" ni mostrar la splash.
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== authKeys.all[0],
    });
    router.replace('/');
  };
}
