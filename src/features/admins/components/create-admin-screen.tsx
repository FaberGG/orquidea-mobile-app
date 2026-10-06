import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

import { ADMIN_LABELS, ADMIN_MESSAGES } from '../constants';
import { getCreateAdminErrorMessage, useCreateAdmin } from '../hooks';
import { createAdminSchema, type CreateAdminFormValues } from '../schemas';
import { type CreatedAdmin } from '../types';

const EMPTY_FORM: CreateAdminFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

/** HU-4: captura los únicos campos del RegisterRequest y confirma la creación. */
export function CreateAdminScreen() {
  const [createdAdmin, setCreatedAdmin] = useState<CreatedAdmin | null>(null);
  const mutation = useCreateAdmin();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: EMPTY_FORM,
  });
  const onSubmit = handleSubmit(async (values) => {
    const created = await mutation
      .mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      })
      .catch(() => null);
    if (created) setCreatedAdmin(created);
  });
  const validationMessage =
    errors.firstName?.message ??
    errors.lastName?.message ??
    errors.email?.message ??
    errors.password?.message ??
    errors.confirmPassword?.message;
  const errorMessage =
    validationMessage ??
    (mutation.isError ? getCreateAdminErrorMessage(mutation.error) : undefined);

  if (createdAdmin) {
    return (
      <FormScreen hasNavigationHeader>
        <ThemedText type="subtitle" accessibilityRole="header">
          {ADMIN_MESSAGES.created}
        </ThemedText>
        <ThemedText>{`${createdAdmin.firstName} ${createdAdmin.lastName}`}</ThemedText>
        <ThemedText themeColor="textSecondary">{createdAdmin.email}</ThemedText>
        <ThemedText themeColor="textSecondary">{ADMIN_LABELS.role}</ThemedText>
        <Button
          label={ADMIN_LABELS.createAnother}
          onPress={() => {
            reset(EMPTY_FORM);
            mutation.reset();
            setCreatedAdmin(null);
          }}
        />
        <Button
          label={ADMIN_LABELS.back}
          variant="link"
          onPress={() => router.replace('/admins')}
        />
      </FormScreen>
    );
  }

  return (
    <FormScreen hasNavigationHeader>
      <View style={styles.header}>
        <ThemedText themeColor="textSecondary">{ADMIN_LABELS.subtitle}</ThemedText>
        <ThemedText type="smallBold">{ADMIN_LABELS.role}</ThemedText>
      </View>
      <View style={styles.fields}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={ADMIN_LABELS.firstName}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={Boolean(errors.firstName)}
              autoCapitalize="words"
              autoComplete="given-name"
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={ADMIN_LABELS.lastName}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={Boolean(errors.lastName)}
              autoCapitalize="words"
              autoComplete="family-name"
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={ADMIN_LABELS.email}
              icon="email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={Boolean(errors.email)}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={ADMIN_LABELS.password}
              icon="password"
              isPassword
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={Boolean(errors.password)}
              autoCapitalize="none"
              autoComplete="new-password"
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={ADMIN_LABELS.confirmPassword}
              icon="password"
              isPassword
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={Boolean(errors.confirmPassword)}
              autoCapitalize="none"
              autoComplete="new-password"
            />
          )}
        />
      </View>
      {errorMessage !== undefined && <FormMessage message={errorMessage} />}
      <Button label={ADMIN_LABELS.create} onPress={onSubmit} isLoading={mutation.isPending} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two, alignItems: 'flex-start' },
  fields: { gap: Spacing.three },
});
