import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useEffect, type ReactNode } from 'react';

import { isApiError, setUnauthorizedHandler } from '@/lib/api';
import { clearToken, getToken, saveToken } from '@/lib/storage';

import { getMe } from '../api';
import { authKeys } from '../constants';
import { type LoginResult, type SessionStatus, type User } from '../types';

export type SessionContextValue = {
  status: SessionStatus;
  user: User | null;
  /** Guarda el token y deja la sesión iniciada con el usuario recibido. */
  signIn: (result: LoginResult) => Promise<void>;
  /** Borra el token y deja la sesión como visitante. */
  signOut: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

/** Restaura la sesión: token guardado → `GET /api/autenticacion/yo`. Sin token, no hay usuario. */
async function restoreSession(): Promise<User | null> {
  const stored = await getToken();
  if (stored === null) return null;
  try {
    return await getMe();
  } catch (error) {
    // 401: el cliente ya borró el token vencido. Otros errores (sin red, 5xx) dejan la sesión como
    // visitante en este arranque, pero conservan el token para reintentar en el siguiente.
    if (isApiError(error)) return null;
    throw error;
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
  const { data: user, isPending } = useQuery({
    queryKey: authKeys.me(),
    queryFn: restoreSession,
    staleTime: Infinity,
    retry: false,
  });

  // Un 401 en cualquier petición autenticada vence la sesión (no hay renovación de token).
  useEffect(
    () => setUnauthorizedHandler(() => queryClient.setQueryData(authKeys.me(), null)),
    [queryClient],
  );

  const value: SessionContextValue = {
    status: isPending ? 'loading' : user ? 'authenticated' : 'guest',
    user: user ?? null,
    signIn: async ({ token, user: signedInUser }) => {
      await saveToken(token);
      queryClient.setQueryData(authKeys.me(), signedInUser);
    },
    signOut: async () => {
      await clearToken();
      queryClient.setQueryData(authKeys.me(), null);
    },
  };

  return <SessionContext value={value}>{children}</SessionContext>;
}
