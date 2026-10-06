import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

import { ADMIN_LABELS, ADMIN_MESSAGES } from '../constants';

/** Entrada de HE-2. El backend aún no expone GET /api/administradores. */
export function AdminListScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <EmptyState icon="manageAccounts" title={ADMIN_MESSAGES.listUnavailable}>
          <Button label={ADMIN_LABELS.createAction} onPress={() => router.push('/admins/new')} />
        </EmptyState>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: Spacing.three },
});
