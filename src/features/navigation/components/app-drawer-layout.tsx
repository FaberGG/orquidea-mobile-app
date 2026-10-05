import { Drawer } from 'expo-router/drawer';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppDrawerContent } from './app-drawer-content';

const DRAWER_WIDTH = 300;

/** Menú lateral que envuelve las pestañas. Se abre con el botón de menú del encabezado o deslizando. */
export function AppDrawerLayout() {
  const theme = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: theme.scrim,
        drawerStyle: {
          width: DRAWER_WIDTH,
          backgroundColor: theme.background,
          borderTopRightRadius: Radius.pill,
          borderBottomRightRadius: Radius.pill,
          overflow: 'hidden',
        },
      }}>
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
