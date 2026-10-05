import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

import { AUTH_LABELS } from '../constants';
import { getRegisterErrorMessage, useRegister } from '../hooks';
import { registerSchema, type RegisterFormValues } from '../schemas';
import { AuthFooter } from './auth-footer';
import { AuthHeader } from './auth-header';

const FIELD_ORDER = [
  'firstName',
  'lastName',
  'email',
  'password',
  'confirmPassword',
  'acceptTerms',
] as const;

/** HU-2: registro de un visitante (diseño Figma "Registrarse", nodo 44:468). */
export function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });
  const registerMutation = useRegister();

  const onSubmit = handleSubmit(({ firstName, lastName, email, password }) =>
    registerMutation.mutate({ firstName, lastName, email, password }),
  );

  // El esquema produce un solo error por envío; se muestra una sola vez bajo el formulario.
  const fieldWithError = FIELD_ORDER.find((field) => errors[field]);
  const validationMessage = fieldWithError ? errors[fieldWithError]?.message : undefined;
  const errorMessage =
    validationMessage ??
    (registerMutation.isError ? getRegisterErrorMessage(registerMutation.error) : undefined);

  return (
    <FormScreen>
      <AuthHeader title={AUTH_LABELS.registerTitle} subtitle={AUTH_LABELS.registerSubtitle} />

      <View style={styles.fields}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={AUTH_LABELS.firstNameLabel}
              placeholder={AUTH_LABELS.firstNamePlaceholder}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={fieldWithError === 'firstName'}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={AUTH_LABELS.lastNameLabel}
              placeholder={AUTH_LABELS.lastNamePlaceholder}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hasError={fieldWithError === 'lastName'}
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="next"
            />
          )}
        />
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
              hasError={fieldWithError === 'email'}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
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
              label={AUTH_LABELS.confirmPasswordLabel}
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
              returnKeyType="done"
            />
          )}
        />
        <Controller
          control={control}
          name="acceptTerms"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              isChecked={value}
              onChange={onChange}
              hasError={fieldWithError === 'acceptTerms'}
              accessibilityLabel={`${AUTH_LABELS.acceptTermsPrefix}${AUTH_LABELS.termsAndConditions} y ${AUTH_LABELS.privacyPolicy}`}>
              <ThemedText type="caption" themeColor="textMuted">
                {AUTH_LABELS.acceptTermsPrefix}
                <ThemedText type="captionBold" themeColor="primary">
                  {AUTH_LABELS.termsAndConditions}
                </ThemedText>
                {' y '}
                <ThemedText type="captionBold" themeColor="primary">
                  {AUTH_LABELS.privacyPolicy}
                </ThemedText>
              </ThemedText>
            </Checkbox>
          )}
        />
      </View>

      {errorMessage !== undefined && <FormMessage message={errorMessage} />}

      <Button
        label={AUTH_LABELS.registerButton}
        onPress={onSubmit}
        isLoading={registerMutation.isPending}
      />

      <AuthFooter
        question={AUTH_LABELS.hasAccount}
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
