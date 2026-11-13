import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { SessionProvider, useSession } from '@/features/auth';
import { configureOfflineQueries, OfflineSync } from '@/features/offline';
import { SightingQueueSync } from '@/features/sightings';
import { connectOnlineManager, queryPersistOptions } from '@/lib/offline';
import { queryClient } from '@/lib/query';
import { RoleProvider } from '@/permissions';

// HU-21 (ADR-0017): las queries sin red quedan en pausa y las fuentes offline se guardan en el dispositivo.
connectOnlineManager();
configureOfflineQueries(queryClient);

type AppProvidersProps = {
  children: ReactNode;
};

/** Conecta el rol de la sesión con `@/permissions` sin que estos dependan de `features/auth`. */
function SessionRoleProvider({ children }: AppProvidersProps) {
  const { role } = useSession();
  return <RoleProvider role={role}>{children}</RoleProvider>;
}

/** Providers globales de la app, en el orden de src/providers/README.md. */
export function AppProviders({ children }: AppProvidersProps) {
  const colorScheme = useColorScheme();

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions}>
      <OfflineSync />
      <SessionProvider>
        {/* HU-22: envía los reportes guardados sin conexión al volver la señal (necesita la sesión). */}
        <SightingQueueSync />
        <SessionRoleProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {children}
          </ThemeProvider>
        </SessionRoleProvider>
      </SessionProvider>
    </PersistQueryClientProvider>
  );
}
