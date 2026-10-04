import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { Can } from '@/permissions';

import { AUTH_LABELS, ROLE_LABELS } from '../constants';
import { useLogout, useSession } from '../hooks';
import { AuthFooter } from './auth-footer';
import { AuthHeader } from './auth-header';

/**
 * Pestaña "Cuenta". Visitante: invitación a iniciar sesión o registrarse. Con sesión: datos del
 * usuario, acceso a gestión de administradores (solo con `admins:read`) y CERRAR SESIÓN (HU-3).
 * Sin diseño en Figma: sigue el estilo de las pantallas de acceso.
 */
export function AccountScreen() {
  const { user } = useSession();
  const logout = useLogout();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
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

              <Can permission="admins:read">
                <ThemedView type="backgroundElement" style={styles.card}>
                  <ThemedText type="smallBold">{AUTH_LABELS.manageAdmins}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {AUTH_LABELS.manageAdminsDescription}
                  </ThemedText>
                </ThemedView>
              </Can>

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
      </SafeAreaView>
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
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
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
