import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

import { AUTH_LABELS } from '../constants';
import { getForgotPasswordErrorMessage, useRequestPasswordReset } from '../hooks';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas';
import { AuthFooter } from './auth-footer';
import { AuthHeader } from './auth-header';

/**
 * HU-1.1 paso 1: solicita el código de 6 dígitos. Sin diseño en Figma: sigue el estilo del login.
 * Al terminar va al paso 2 con el correo, exista o no la cuenta (CA2).
 */
export function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const requestMutation = useRequestPasswordReset();

  const onSubmit = handleSubmit(({ email }) =>
    requestMutation.mutate(email, {
      onSuccess: () => router.push({ pathname: '/reset-password', params: { email } }),
    }),
  );

  const errorMessage =
    errors.email?.message ??
    (requestMutation.isError ? getForgotPasswordErrorMessage(requestMutation.error) : undefined);

  return (
    <FormScreen>
      <AuthHeader
        title={AUTH_LABELS.forgotPasswordTitle}
        subtitle={AUTH_LABELS.forgotPasswordSubtitle}
      />

      <View style={styles.fields}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={AUTH_LABELS.emailLabel}
              icon="email"
              placeholder={AUTH_LABELS.emailPlaceholder}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={Boolean(errors.email)}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={onSubmit}
            />
          )}
        />
      </View>

      {errorMessage !== undefined && <FormMessage message={errorMessage} />}

      <Button
        label={AUTH_LABELS.sendButton}
        onPress={onSubmit}
        isLoading={requestMutation.isPending}
      />

      <AuthFooter
        question={AUTH_LABELS.rememberedPassword}
        linkLabel={AUTH_LABELS.loginLink}
        onPress={() => router.replace('/login')}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: Spacing.three,
  },
});
