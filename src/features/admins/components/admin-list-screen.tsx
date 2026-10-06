import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Screen } from '@/components/layout/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isApiError } from '@/lib/api';

import { ADMIN_LABELS, ADMIN_MESSAGES } from '../constants';
import { useAdmins } from '../hooks';
import { type Admin } from '../types';

export function AdminListScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const { data = [], isPending, error, refetch } = useAdmins();
  const filtered = data.filter((admin) =>
    `${admin.firstName} ${admin.lastName} ${admin.email}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );

  const renderAdmin = ({ item }: { item: Admin }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver cuenta de ${item.firstName} ${item.lastName}`}
      onPress={() => router.push({ pathname: '/admins/[id]', params: { id: item.id } })}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.background, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
        <ThemedText type="smallBold" themeColor="primary">
          {`${item.firstName[0] ?? ''}${item.lastName[0] ?? ''}`.toUpperCase()}
        </ThemedText>
      </View>
      <View style={styles.rowBody}>
        <ThemedText type="smallBold" themeColor="textLabel" numberOfLines={1}>
          {`${item.firstName} ${item.lastName}`}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
          {item.email}
        </ThemedText>
        {!item.isEnabled && (
          <ThemedText type="caption" themeColor="danger">
            {ADMIN_LABELS.disabled}
          </ThemedText>
        )}
      </View>
      <ThemedText type="captionBold" themeColor="textSecondary">
        {item.role === 'superadmin' ? ADMIN_LABELS.superadminRole : ADMIN_LABELS.adminRole}
      </ThemedText>
      <Icon name="chevronRight" size={18} color="textSecondary" />
    </Pressable>
  );

  return (
    <Screen>
      <View style={styles.content}>
        <TextField
          label="Buscar administrador"
          placeholder="Nombre o correo"
          value={search}
          onChangeText={setSearch}
          icon="search"
          autoCapitalize="none"
        />
        {isPending && <ActivityIndicator color={theme.primary} />}
        {error && (
          <EmptyState
            icon="manageAccounts"
            title={
              isApiError(error) && error.status === 404
                ? ADMIN_MESSAGES.listUnavailable
                : ADMIN_MESSAGES.loadError
            }>
            <Button label={ADMIN_LABELS.retry} onPress={() => void refetch()} />
          </EmptyState>
        )}
        {!isPending && !error && filtered.length === 0 && (
          <EmptyState
            icon="manageAccounts"
            title={search.trim() ? ADMIN_LABELS.noSearchResults : ADMIN_LABELS.noAdmins}>
            <Button label={ADMIN_LABELS.createAction} onPress={() => router.push('/admins/new')} />
          </EmptyState>
        )}
        {!isPending && !error && filtered.length > 0 && (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderAdmin}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  list: { paddingBottom: Spacing.four },
  separator: { height: Spacing.two },
  row: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.7 },
});
