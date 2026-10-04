import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useSession } from '@/features/auth';
import { AppProviders } from '@/providers';

// La splash sigue visible mientras se restaura la sesión guardada (evita parpadeos visitante → logueado).
SplashScreen.preventAutoHideAsync();

function SplashScreenController() {
  const { status } = useSession();
  if (status !== 'loading') {
    SplashScreen.hide();
  }
  return null;
}

function RootNavigator() {
  const { isAuthenticated } = useSession();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />

      {/* Login, registro y recuperación solo sin sesión: al iniciar sesión se retiran de la pila. */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <SplashScreenController />
      <RootNavigator />
    </AppProviders>
  );
}
