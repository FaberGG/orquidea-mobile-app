import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';

import { AUTH_LABELS, ROLE_LABELS } from '../constants';
import { useLogout, useSession } from '../hooks';
import { AuthFooter } from './auth-footer';
import { AuthHeader } from './auth-header';

/**
 * Pestaña "Usuario". Visitante: invitación a iniciar sesión o registrarse. Con sesión: datos y rol del
 * usuario y CERRAR SESIÓN (HU-3). La gestión de administradores se abre desde el menú lateral.
 * Sin diseño en Figma: sigue el estilo de las pantallas de acceso.
 */
export function AccountScreen() {
  const { user } = useSession();
  const logout = useLogout();

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        {user ? (
          <>
            <AuthHeader title={AUTH_LABELS.accountTitle} subtitle={user.email} />

            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">{`${user.firstName} ${user.lastName}`}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {`${AUTH_LABELS.roleLabel}: ${ROLE_LABELS[user.role]}`}
              </ThemedText>
            </ThemedView>

            <View style={styles.spacer} />
            <Button label={AUTH_LABELS.logoutButton} onPress={logout} />
          </>
        ) : (
          <>
            <AuthHeader
              title={AUTH_LABELS.accountTitle}
              subtitle={AUTH_LABELS.accountGuestSubtitle}
            />
            <Button label={AUTH_LABELS.loginButtonGuest} onPress={() => router.push('/login')} />
            <AuthFooter
              question={AUTH_LABELS.noAccount}
              linkLabel={AUTH_LABELS.registerLink}
              onPress={() => router.push('/register')}
            />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 28,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: {
    borderRadius: Radius.medium,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  spacer: {
    flexGrow: 1,
  },
});
