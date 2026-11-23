import { onlineManager, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

import { isApiError, setForbiddenHandler, setUnauthorizedHandler } from '@/lib/api';
import { clearToken, getToken, saveToken } from '@/lib/storage';

import { getMe } from '../api';
import { authKeys } from '../constants';
import { isSessionDependentQuery } from '../hooks/session-queries';
import { type LoginResult, type SessionStatus, type User } from '../types';
import { clearSessionUser, getSessionUser, saveSessionUser } from '../utils/session-user-storage';

export type SessionContextValue = {
  status: SessionStatus;
  user: User | null;
  /** Guarda el token y deja la sesión iniciada con el usuario recibido. */
  signIn: (result: LoginResult) => Promise<void>;
  /** Borra el token y deja la sesión como visitante. */
  signOut: () => Promise<void>;
  /** Actualiza los datos del usuario y sus permisos desde el servidor. */
  refreshSession: () => Promise<void>;
  /** Aplica el rol confirmado por una mutación del servidor a la cuenta actual. */
  applyConfirmedRole: (role: User['role']) => void;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

/** `GET /yo` no llegó a una respuesta válida del backend: sin red, tiempo agotado o error del servidor. */
function isBackendUnavailable(error: unknown): boolean {
  return isApiError(error) && (error.status === 0 || error.status >= 500);
}

/**
 * Restaura la sesión: token guardado → `GET /api/autenticacion/yo`. Sin token (o vencido), no hay usuario.
 * Si el backend no está disponible, usa el último usuario confirmado guardado en el dispositivo (HU-21) y
 * llama a `onRestoredFromDevice` para volver a confirmarlo cuando regrese la conexión.
 */
async function restoreSession(onRestoredFromDevice: () => void): Promise<User | null> {
  const stored = await getToken();
  if (stored === null) {
    await clearSessionUser();
    return null;
  }
  try {
    const user = await getMe();
    await saveSessionUser(user);
    return user;
  } catch (error) {
    if (!isApiError(error)) throw error;
    if (isBackendUnavailable(error)) {
      // Se conserva el token; si hay usuario guardado, la sesión sigue iniciada sin conexión.
      const savedUser = await getSessionUser();
      if (savedUser) onRestoredFromDevice();
      return savedUser;
    }
    // 401: el cliente ya borró el token vencido. Otro error HTTP: visitante en este arranque.
    if (error.status === 401) await clearSessionUser();
    return null;
  }
}

type SessionProviderProps = {
  children: ReactNode;
};

/**
 * Mantiene la sesión (estado, usuario y rol). El usuario se guarda en la caché de servidor bajo
 * `authKeys.me()`, de modo que iniciar o cerrar sesión es actualizar esa entrada.
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const queryClient = useQueryClient();
  // `true` mientras la sesión viene del dispositivo y la API aún no la confirmó en este arranque.
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const { data: user, isPending } = useQuery({
    queryKey: authKeys.me(),
    queryFn: () => restoreSession(() => setIsUnconfirmed(true)),
    staleTime: Infinity,
    retry: false,
    // Sin red, el modo por defecto ('online') pausa la query: quedaría `pending` para siempre y la
    // splash no se ocultaría. Siempre se ejecuta: sin token resuelve sin tocar la red, y un fallo de red
    // (ApiError status 0, con timeout) usa el usuario guardado en el dispositivo.
    networkMode: 'always',
  });

  const refreshSession = useCallback(async () => {
    const previousUser = queryClient.getQueryData<User | null>(authKeys.me()) ?? null;
    const updatedUser = await getMe();
    // Una respuesta tardía no puede restaurar la sesión después de cerrar sesión o cambiar de cuenta.
    if ((queryClient.getQueryData<User | null>(authKeys.me()) ?? null) !== previousUser) return;
    if (previousUser?.role !== updatedUser.role) {
      // Los datos obtenidos con el rol anterior no deben permanecer en caché.
      queryClient.removeQueries({ predicate: isSessionDependentQuery });
    }
    queryClient.setQueryData(authKeys.me(), updatedUser);
    setIsUnconfirmed(false);
    await saveSessionUser(updatedUser);
  }, [queryClient]);

  // Sesión abierta sin conexión: al volver la red se confirma con la API (rol vigente o token vencido → 401).
  useEffect(() => {
    if (!isUnconfirmed) return;
    const confirm = () => {
      if (!onlineManager.isOnline()) return;
      refreshSession().catch(() => {
        // Sigue sin backend: se reintenta con el próximo cambio de red. Un 401 ya cerró la sesión.
      });
    };
    confirm();
    return onlineManager.subscribe(confirm);
  }, [isUnconfirmed, refreshSession]);

  // Un 401 vence la sesión; un 403 vuelve a consultar el rol antes de actualizar las rutas.
  useEffect(() => {
    const removeUnauthorizedHandler = setUnauthorizedHandler(() => {
      queryClient.removeQueries({ predicate: isSessionDependentQuery });
      queryClient.setQueryData(authKeys.me(), null);
      setIsUnconfirmed(false);
      void clearSessionUser();
    });
    const removeForbiddenHandler = setForbiddenHandler(() =>
      refreshSession().catch(() => {
        // Un fallo de red no invalida la sesión; el backend mantiene la autorización efectiva.
      }),
    );
    return () => {
      removeUnauthorizedHandler();
      removeForbiddenHandler();
    };
  }, [queryClient, refreshSession]);

  const value: SessionContextValue = {
    status: isPending ? 'loading' : user ? 'authenticated' : 'guest',
    user: user ?? null,
    signIn: async ({ token, user: signedInUser }) => {
      await saveToken(token);
      await saveSessionUser(signedInUser);
      setIsUnconfirmed(false);
      queryClient.setQueryData(authKeys.me(), signedInUser);
    },
    signOut: async () => {
      await Promise.all([clearToken(), clearSessionUser()]);
      setIsUnconfirmed(false);
      queryClient.removeQueries({ predicate: isSessionDependentQuery });
      queryClient.setQueryData(authKeys.me(), null);
    },
    refreshSession,
    applyConfirmedRole: (role) => {
      const currentUser = queryClient.getQueryData<User | null>(authKeys.me());
      if (!currentUser || currentUser.role === role) return;
      const updatedUser = { ...currentUser, role };
      queryClient.removeQueries({ predicate: isSessionDependentQuery });
      queryClient.setQueryData(authKeys.me(), updatedUser);
      void saveSessionUser(updatedUser);
    },
  };

  return <SessionContext value={value}>{children}</SessionContext>;
}
