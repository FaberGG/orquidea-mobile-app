import { Redirect, router, Stack } from 'expo-router';
import { DrawerActions } from 'expo-router/react-navigation';

import { AppHeader, HeaderIconButton } from '@/components/layout/app-header';
import { ADMIN_LABELS } from '@/features/admins';
import { useSession } from '@/features/auth';
import { NAVIGATION_LABELS } from '@/features/navigation';
import { usePermission } from '@/permissions';

export default function AdminsLayout() {
  const { status } = useSession();
  const canRead = usePermission('admins:read');
  if (status === 'loading') return null;
  if (!canRead) return <Redirect href="/" />;

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
        options={{
          header: ({ navigation }) => (
            <AppHeader
              title={ADMIN_LABELS.listTitle}
              menuAccessibilityLabel={NAVIGATION_LABELS.openMenu}
              onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              right={
                <HeaderIconButton
                  icon="add"
                  accessibilityLabel={ADMIN_LABELS.createAction}
                  onPress={() => router.push('/admins/new')}
                />
              }
            />
          ),
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          header: ({ navigation }) => (
            <AppHeader
              title={ADMIN_LABELS.title}
              menuAccessibilityLabel={NAVIGATION_LABELS.openMenu}
              onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              right={
                <HeaderIconButton
                  icon="chevronLeft"
                  accessibilityLabel="Volver a administradores"
                  onPress={() => router.back()}
                />
              }
            />
          ),
        }}
      />
    </Stack>
  );
}
