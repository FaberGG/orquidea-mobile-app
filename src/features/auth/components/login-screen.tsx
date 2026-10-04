import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

import { getLoginErrorMessage, useLogin } from '../hooks';
import { loginSchema, type LoginFormValues } from '../schemas';

/** HU-1: inicio de sesión con correo y contraseña. */
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

  const onSubmit = handleSubmit((values) => loginMutation.mutate(values));

  // CA3 tiene un único mensaje para ambos campos: se muestra una sola vez.
  const validationMessage = errors.email?.message ?? errors.password?.message;
  const errorMessage =
    validationMessage ??
    (loginMutation.isError ? getLoginErrorMessage(loginMutation.error) : undefined);

  return (
    <FormScreen>
      <View style={styles.header}>
        <ThemedText type="subtitle" accessibilityRole="header">
          Humedal La Orquídea
        </ThemedText>
        <ThemedText themeColor="textSecondary">Ingresa con tu correo y contraseña.</ThemedText>
      </View>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Correo electrónico"
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
            label="Contraseña"
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

      {errorMessage !== undefined && <FormMessage message={errorMessage} />}

      <Button label="INGRESAR" onPress={onSubmit} isLoading={loginMutation.isPending} />

      <Button
        variant="link"
        label="¿Olvidaste tu contraseña?"
        onPress={() => router.push('/forgot-password')}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
});
