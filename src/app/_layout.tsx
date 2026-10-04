import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useSession } from '@/features/auth';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { AppProviders } from '@/providers';

// La splash sigue visible mientras cargan las fuentes y se restaura la sesión guardada
// (evita parpadeos de tipografía y de visitante → logueado).
SplashScreen.preventAutoHideAsync();

function SplashScreenController({ areFontsReady }: { areFontsReady: boolean }) {
  const { status } = useSession();
  if (areFontsReady && status !== 'loading') {
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
  const areFontsReady = useAppFonts();

  return (
    <AppProviders>
      <SplashScreenController areFontsReady={areFontsReady} />
      <RootNavigator />
    </AppProviders>
  );
}
