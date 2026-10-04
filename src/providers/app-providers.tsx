import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { SessionProvider, useSession } from '@/features/auth';
import { queryClient } from '@/lib/query';
import { RoleProvider } from '@/permissions';

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
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SessionRoleProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {children}
          </ThemeProvider>
        </SessionRoleProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
