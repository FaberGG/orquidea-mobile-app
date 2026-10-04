import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

import { AUTH_LABELS, AUTH_MESSAGES } from '../constants';
import { getLoginErrorMessage, useLogin } from '../hooks';
import { loginSchema, type LoginFormValues } from '../schemas';

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
  // HU-2 CA1: tras registrarse se vuelve aquí con `?registered=true`.
  const { registered } = useLocalSearchParams<{ registered?: string }>();
  const hasJustRegistered = registered === 'true';

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

      <View style={styles.header}>
        <ThemedText type="subtitle" accessibilityRole="header" style={styles.centered}>
          {AUTH_LABELS.loginTitle}
        </ThemedText>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={[styles.centered, styles.subtitle]}>
          {AUTH_LABELS.loginSubtitle}
        </ThemedText>
      </View>

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
        hasJustRegistered && (
          <FormMessage variant="success" message={AUTH_MESSAGES.registerSuccess} />
        )
      )}

      <Button
        label={AUTH_LABELS.loginButton}
        onPress={onSubmit}
        isLoading={loginMutation.isPending}
      />

      <View style={styles.footer}>
        <ThemedText type="smallSemiBold" themeColor="textMuted">
          {AUTH_LABELS.noAccount}
        </ThemedText>
        <Pressable
          accessibilityRole="link"
          hitSlop={Spacing.three}
          onPress={() => router.push('/register')}>
          <ThemedText type="smallBold" themeColor="primary">
            {AUTH_LABELS.registerLink}
          </ThemedText>
        </Pressable>
      </View>
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
  header: {
    alignItems: 'center',
    gap: 14,
    padding: 10,
  },
  centered: {
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 224,
  },
  fields: {
    gap: Spacing.three,
  },
  forgotPassword: {
    alignItems: 'flex-end',
  },
  footer: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
  },
});
