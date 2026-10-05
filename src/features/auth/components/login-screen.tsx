import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

import { AUTH_LABELS, AUTH_MESSAGES } from '../constants';
import { getLoginErrorMessage, useLogin } from '../hooks';
import { loginSchema, type LoginFormValues } from '../schemas';
import { AuthFooter } from './auth-footer';
import { AuthHeader } from './auth-header';

const OPOSSUM = require('@/assets/images/illustrations/opossum.png');

/** HU-1: inicio de sesión con correo y contraseña (diseño Figma "Inicio de sesion", nodo 43:229). */
export function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const loginMutation = useLogin();
  // Se vuelve aquí con `?registered=true` tras registrarse (HU-2 CA1) o con
  // `?passwordReset=true` tras restablecer la contraseña (HU-1.1).
  const { registered, passwordReset } = useLocalSearchParams<{
    registered?: string;
    passwordReset?: string;
  }>();
  const successMessage =
    registered === 'true'
      ? AUTH_MESSAGES.registerSuccess
      : passwordReset === 'true'
        ? AUTH_MESSAGES.passwordResetSuccess
        : undefined;

  const onSubmit = handleSubmit((values) => loginMutation.mutate(values));

  // CA3 tiene un único mensaje para ambos campos: se muestra una sola vez.
  const validationMessage = errors.email?.message ?? errors.password?.message;
  const errorMessage =
    validationMessage ??
    (loginMutation.isError ? getLoginErrorMessage(loginMutation.error) : undefined);

  return (
    <FormScreen>
      <View style={styles.illustration}>
        <Image source={OPOSSUM} style={styles.opossum} contentFit="contain" accessible={false} />
      </View>

      <AuthHeader title={AUTH_LABELS.loginTitle} subtitle={AUTH_LABELS.loginSubtitle} />

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
              textContentType="username"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={AUTH_LABELS.passwordLabel}
              icon="password"
              placeholder={AUTH_LABELS.passwordPlaceholder}
              isPassword
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={Boolean(errors.password)}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
            />
          )}
        />

        <View style={styles.forgotPassword}>
          <Button
            variant="link"
            label={AUTH_LABELS.forgotPasswordLink}
            onPress={() => router.push('/forgot-password')}
          />
        </View>
      </View>

      {errorMessage !== undefined ? (
        <FormMessage message={errorMessage} />
      ) : (
        successMessage !== undefined && <FormMessage variant="success" message={successMessage} />
      )}

      <Button
        label={AUTH_LABELS.loginButton}
        onPress={onSubmit}
        isLoading={loginMutation.isPending}
      />

      <AuthFooter
        question={AUTH_LABELS.noAccount}
        linkLabel={AUTH_LABELS.registerLink}
        onPress={() => router.push('/register')}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center',
    padding: 10,
  },
  opossum: {
    width: 90,
    height: 175,
  },
  fields: {
    gap: Spacing.three,
  },
  forgotPassword: {
    alignItems: 'flex-end',
  },
});
