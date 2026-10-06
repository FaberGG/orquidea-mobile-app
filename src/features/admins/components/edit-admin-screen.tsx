import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Switch, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/features/auth';
import { useTheme } from '@/hooks/use-theme';
import { isApiError } from '@/lib/api';

import { ADMIN_LABELS, ADMIN_MESSAGES } from '../constants';
import { useAdmin, useRevokeAdmin, useUpdateAdmin } from '../hooks';
import { updateAdminSchema, type UpdateAdminFormValues } from '../schemas';
import { type Admin } from '../types';

function getAdminError(error: unknown): string {
  if (!isApiError(error)) return ADMIN_MESSAGES.unexpectedError;
  if (error.kind !== 'http') return ADMIN_MESSAGES.networkError;
  if (error.status === 404) return ADMIN_MESSAGES.notFound;
  if (error.status === 409 && error.serverMessage?.includes('único superadministrador'))
    return ADMIN_MESSAGES.onlySuperadmin;
  if (error.status >= 400 && error.status < 500 && error.serverMessage) return error.serverMessage;
  return ADMIN_MESSAGES.unexpectedError;
}

function AdminForm({ admin }: { admin: Admin }) {
  const theme = useTheme();
  const { user, applyConfirmedRole } = useSession();
  const update = useUpdateAdmin(admin.id);
  const revoke = useRevokeAdmin(admin.id);
  const [confirming, setConfirming] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [saved, setSaved] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateAdminFormValues>({
    resolver: zodResolver(updateAdminSchema),
    defaultValues: {
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      isEnabled: admin.isEnabled,
    },
  });
  const busy = update.isPending || revoke.isPending;

  const clearSaveFeedback = () => {
    setSaved(false);
    if (update.isError) update.reset();
  };

  if (revoked) {
    return (
      <FormScreen hasNavigationHeader>
        <ThemedText type="subtitle">{ADMIN_MESSAGES.revoked}</ThemedText>
        <Button label={ADMIN_LABELS.back} onPress={() => router.replace('/admins')} />
      </FormScreen>
    );
  }

  const onSave = handleSubmit(async (values) => {
    setSaved(false);
    try {
      await update.mutateAsync(values);
      setSaved(true);
    } catch {
      // El mensaje de error se muestra desde el estado de la mutación.
    }
  });

  const onRevoke = async () => {
    setConfirming(false);
    try {
      await revoke.mutateAsync();
      if (user?.id === admin.id) {
        // La respuesta de revocación confirma que esta cuenta pasó a usuario registrado.
        applyConfirmedRole('user');
        router.replace('/');
      } else {
        setRevoked(true);
      }
    } catch {
      // La API conserva la cuenta cuando rechaza la revocación.
    }
  };

  return (
    <FormScreen hasNavigationHeader>
      <View style={styles.intro}>
        <ThemedText type="smallBold" themeColor="textLabel">
          {admin.role === 'superadmin' ? ADMIN_LABELS.superadminRole : ADMIN_LABELS.adminRole}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{admin.email}</ThemedText>
      </View>
      {admin.role === 'admin' && (
        <>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label={ADMIN_LABELS.firstName}
                value={value}
                onChangeText={(next) => {
                  clearSaveFeedback();
                  onChange(next);
                }}
                onBlur={onBlur}
                hasError={Boolean(errors.firstName)}
                autoCapitalize="words"
                editable={!busy}
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label={ADMIN_LABELS.lastName}
                value={value}
                onChangeText={(next) => {
                  clearSaveFeedback();
                  onChange(next);
                }}
                onBlur={onBlur}
                hasError={Boolean(errors.lastName)}
                autoCapitalize="words"
                editable={!busy}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label={ADMIN_LABELS.email}
                value={value}
                onChangeText={(next) => {
                  clearSaveFeedback();
                  onChange(next);
                }}
                onBlur={onBlur}
                hasError={Boolean(errors.email)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!busy}
              />
            )}
          />
          <Controller
            control={control}
            name="isEnabled"
            render={({ field: { value, onChange } }) => (
              <View style={styles.statusRow}>
                <ThemedText themeColor="textLabel">
                  {ADMIN_LABELS.status}: {value ? ADMIN_LABELS.enabled : ADMIN_LABELS.disabled}
                </ThemedText>
                <Switch
                  accessibilityLabel={ADMIN_LABELS.status}
                  value={value}
                  onValueChange={(next) => {
                    clearSaveFeedback();
                    onChange(next);
                  }}
                  disabled={busy}
                  trackColor={{ true: theme.primary }}
                />
              </View>
            )}
          />
          {(errors.firstName || errors.lastName || errors.email) && (
            <FormMessage
              message={
                errors.firstName?.message ??
                errors.lastName?.message ??
                errors.email?.message ??
                ADMIN_MESSAGES.requiredFields
              }
            />
          )}
          {saved && <ThemedText themeColor="success">{ADMIN_MESSAGES.saved}</ThemedText>}
          {update.isError && <FormMessage message={getAdminError(update.error)} />}
          <Button
            label={ADMIN_LABELS.save}
            onPress={onSave}
            isLoading={update.isPending}
            disabled={revoke.isPending}
          />
        </>
      )}
      {revoke.isError && <FormMessage message={getAdminError(revoke.error)} />}
      <Button
        label={ADMIN_LABELS.revoke}
        variant="link"
        onPress={() => {
          revoke.reset();
          setConfirming(true);
        }}
        isLoading={revoke.isPending}
        disabled={update.isPending}
      />
      <Modal
        visible={confirming}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!revoke.isPending) setConfirming(false);
        }}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
            <ThemedText type="subtitle">{ADMIN_LABELS.revokeTitle}</ThemedText>
            <ThemedText>{ADMIN_LABELS.revokeQuestion}</ThemedText>
            <Button label={ADMIN_LABELS.revoke} onPress={() => void onRevoke()} />
            <Pressable
              accessibilityRole="button"
              disabled={revoke.isPending}
              onPress={() => setConfirming(false)}
              style={styles.cancel}>
              <ThemedText themeColor="primary">{ADMIN_LABELS.cancel}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </FormScreen>
  );
}

export function EditAdminScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { data, isPending, error, refetch } = useAdmin(id);
  if (isPending)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  if (error || !data) {
    return (
      <EmptyState
        icon="manageAccounts"
        title={error ? getAdminError(error) : ADMIN_MESSAGES.notFound}>
        <Button label={ADMIN_LABELS.retry} onPress={() => void refetch()} />
      </EmptyState>
    );
  }
  return <AdminForm key={data.id} admin={data} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  intro: { gap: Spacing.one },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.medium,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cancel: { alignItems: 'center', padding: Spacing.two },
});
