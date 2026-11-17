import { Redirect, router, Stack } from 'expo-router';

import { AppHeader, HeaderIconButton } from '@/components/layout/app-header';
import { ADMIN_LABELS } from '@/features/admins';
import { useSession } from '@/features/auth';
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
          header: () => (
            <AppHeader
              title={ADMIN_LABELS.listTitle}
              leadingIcon="chevronLeft"
              menuAccessibilityLabel="Volver"
              onMenuPress={() => router.back()}
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
          header: () => (
            <AppHeader
              title={ADMIN_LABELS.title}
              leadingIcon="chevronLeft"
              menuAccessibilityLabel="Volver"
              onMenuPress={() => router.back()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          header: () => (
            <AppHeader
              title={ADMIN_LABELS.editTitle}
              leadingIcon="chevronLeft"
              menuAccessibilityLabel="Volver"
              onMenuPress={() => router.back()}
            />
          ),
        }}
      />
    </Stack>
  );
}
