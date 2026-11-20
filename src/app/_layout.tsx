import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useSession } from '@/features/auth';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useTheme } from '@/hooks/use-theme';
import { usePermission } from '@/permissions';
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
  const theme = useTheme();
  // Gestión de contenido (fichas, y el resto de administración) solo para admin y superadmin.
  const canManageContent = usePermission('species:create');
  // Escribir un reporte de avistamiento (HU-18): usuario registrado, administrador y superadministrador.
  const canCreateSighting = usePermission('sightings:create');
  // Gesti�n de cuentas de administrador (HE-2): solo superadministrador.
  const canReadAdmins = usePermission('admins:read');

  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="(drawer)" />
      {/* Foto de un reporte a pantalla completa (HU-20), abierta para todos los roles. */}
      <Stack.Screen
        name="sightings/photo"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen name="qr" options={{ headerShown: false }} />

      {/* Login, registro y recuperación solo sin sesión: al iniciar sesión se retiran de la pila. */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={canCreateSighting}>
        <Stack.Screen name="sightings/new" />
      </Stack.Protected>

      <Stack.Protected guard={canReadAdmins}>
        <Stack.Screen name="admins" />
      </Stack.Protected>

      <Stack.Protected guard={canManageContent}>
        <Stack.Screen name="(admin)" />
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
