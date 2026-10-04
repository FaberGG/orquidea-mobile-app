import { use } from 'react';

import { type Role } from '@/permissions';

import { SessionContext, type SessionContextValue } from '../components/session-provider';

export type Session = SessionContextValue & {
  isAuthenticated: boolean;
  /** Rol efectivo: el del usuario o `visitor` sin sesión. */
  role: Role;
};

/** Lee la sesión actual. Debe usarse dentro de `SessionProvider`. */
export function useSession(): Session {
  const context = use(SessionContext);
  if (context === null) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>.');
  }
  return {
    ...context,
    isAuthenticated: context.status === 'authenticated',
    role: context.user?.role ?? 'visitor',
  };
}
