import { DrawerActions } from 'expo-router/react-navigation';
import { Tabs } from 'expo-router/tabs';

import { AppHeader } from '@/components/layout/app-header';
import { TAB_ICON_SIZE, TabBar } from '@/components/layout/tab-bar';
import { Icon, type IconName } from '@/components/ui/icon';

import { NAVIGATION_LABELS } from '../constants';

function tabIcon(name: IconName) {
  function TabIcon({ focused }: { focused: boolean }) {
    return <Icon name={name} size={TAB_ICON_SIZE} color={focused ? 'navActive' : 'navInactive'} />;
  }
  return TabIcon;
}

/**
 * Pestañas inferiores, iguales para todos los roles (ROLES-Y-PERMISOS §2): lo que cambia según el rol
 * se resuelve dentro de cada pantalla con permisos. Orden y estilo del Figma ("Listar fichas").
 */
export function AppTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        header: ({ navigation }) => (
          <AppHeader
            menuAccessibilityLabel={NAVIGATION_LABELS.openMenu}
            onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: NAVIGATION_LABELS.tabHome, tabBarIcon: tabIcon('home') }}
      />
      <Tabs.Screen
        name="community"
        options={{ title: NAVIGATION_LABELS.tabCommunity, tabBarIcon: tabIcon('community') }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: NAVIGATION_LABELS.tabMap, tabBarIcon: tabIcon('map') }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: NAVIGATION_LABELS.tabUser, tabBarIcon: tabIcon('user') }}
      />
    </Tabs>
  );
}
