import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

import { AUTH_LABELS, AUTH_MESSAGES } from '../constants';
import {
  getForgotPasswordErrorMessage,
  getResetPasswordErrorMessage,
  useRequestPasswordReset,
  useResetPassword,
} from '../hooks';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas';
import { AuthFooter } from './auth-footer';
import { AuthHeader } from './auth-header';

const FIELD_ORDER = ['code', 'password', 'confirmPassword'] as const;

/**
 * HU-1.1 paso 2: código de 6 dígitos y nueva contraseña. Llega desde el paso 1 con `?email=`.
 * Sin diseño en Figma: sigue el estilo del login.
 */
export function ResetPasswordScreen() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
  });
  const resetMutation = useResetPassword();
  const resendMutation = useRequestPasswordReset();

  const onSubmit = handleSubmit(({ code, password }) =>
    resetMutation.mutate({ email, code, password }),
  );

  const fieldWithError = FIELD_ORDER.find((field) => errors[field]);
  const errorMessage =
    (fieldWithError ? errors[fieldWithError]?.message : undefined) ??
    (resetMutation.isError ? getResetPasswordErrorMessage(resetMutation.error) : undefined) ??
    (resendMutation.isError ? getForgotPasswordErrorMessage(resendMutation.error) : undefined);

  if (email.length === 0) {
    return (
      <FormScreen>
        <AuthHeader title={AUTH_LABELS.resetPasswordTitle} subtitle="" />
        <FormMessage message={AUTH_MESSAGES.missingResetEmail} />
        <Button
          label={AUTH_LABELS.requestCodeAgain}
          onPress={() => router.replace('/forgot-password')}
        />
      </FormScreen>
    );
  }

  return (
    <FormScreen>
      <AuthHeader
        title={AUTH_LABELS.resetPasswordTitle}
        subtitle={
          <>
            {AUTH_LABELS.resetPasswordSubtitle}{' '}
            <ThemedText type="smallBold" themeColor="textSecondary">
              {email}
            </ThemedText>
          </>
        }
      />

      {/* HU-1.1 CA1/CA2: confirmación del envío, idéntica exista o no la cuenta. */}
      <FormMessage variant="success" message={AUTH_MESSAGES.passwordResetRequested} />

      <View style={styles.fields}>
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={AUTH_LABELS.codeLabel}
              placeholder={AUTH_LABELS.codePlaceholder}
              value={value}
              onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
              onBlur={onBlur}
              hasError={fieldWithError === 'code'}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              returnKeyType="next"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={AUTH_LABELS.newPasswordLabel}
              icon="password"
              placeholder={AUTH_LABELS.passwordPlaceholder}
              isPassword
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={fieldWithError === 'password'}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={AUTH_LABELS.confirmNewPasswordLabel}
              icon="password"
              placeholder={AUTH_LABELS.passwordPlaceholder}
              isPassword
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={fieldWithError === 'confirmPassword'}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
            />
          )}
        />
      </View>

      {errorMessage !== undefined && <FormMessage message={errorMessage} />}

      <Button
        label={AUTH_LABELS.resetButton}
        onPress={onSubmit}
        isLoading={resetMutation.isPending}
      />

      <AuthFooter
        question={AUTH_LABELS.noCode}
        linkLabel={AUTH_LABELS.resendCode}
        onPress={() => resendMutation.mutate(email)}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: Spacing.three,
  },
});
