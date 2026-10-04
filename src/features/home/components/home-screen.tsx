import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/features/auth';
import { Can } from '@/permissions';

import { ROLE_LABELS } from '../constants';
import { HomeOption } from './home-option';

/**
 * Inicio: misma pantalla para todos los roles; las opciones se muestran según permisos
 * (HU-1 CA1: "pantalla de inicio con las opciones habilitadas para el rol del usuario").
 */
export function HomeScreen() {
  const { user } = useSession();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="subtitle" accessibilityRole="header">
              {user ? `Hola, ${user.firstName}` : 'Humedal La Orquídea'}
            </ThemedText>
            {user ? (
              <ThemedText themeColor="textSecondary">Rol: {ROLE_LABELS[user.role]}</ThemedText>
            ) : (
              <ThemedText themeColor="textSecondary">
                Plataforma de educación ambiental del humedal.
              </ThemedText>
            )}
          </View>

          <Can permission="auth:login">
            <ThemedText>Inicia sesión para acceder a las opciones de tu cuenta.</ThemedText>
            <Button label="INICIAR SESIÓN" onPress={() => router.push('/login')} />
          </Can>

          <View style={styles.options}>
            <ThemedText type="smallBold" accessibilityRole="header">
              Opciones disponibles
            </ThemedText>
            <Can permission="species:read">
              <HomeOption
                title="Fichas taxonómicas"
                description="Consulta las aves, plantas e insectos del humedal."
              />
            </Can>
            <Can permission="species:create">
              <HomeOption
                title="Gestionar fichas taxonómicas"
                description="Crea y edita las fichas de las especies."
              />
            </Can>
            <Can permission="admins:read">
              <HomeOption
                title="Gestionar administradores"
                description="Crea, edita y revoca cuentas de administrador."
              />
            </Can>
          </View>
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
    gap: Spacing.four,
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.two,
  },
  options: {
    gap: Spacing.three,
  },
});
