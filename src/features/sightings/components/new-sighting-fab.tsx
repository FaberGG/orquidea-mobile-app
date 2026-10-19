import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePermission } from '@/permissions';

import { SIGHTINGS_LABELS } from '../constants';
import { LoginRequiredDialog } from './login-required-dialog';

const FAB_SIZE = 56;

/**
 * Botón flotante "Escribir un reporte" (Figma: "Publicar reporte"). El usuario registrado va al
 * formulario (HU-18); el visitante ve el aviso para iniciar sesión. Los administradores no lo ven: la
 * API no les permite crear reportes (responde `403`).
 */
export function NewSightingFab() {
  const theme = useTheme();
  const canCreate = usePermission('sightings:create');
  const isVisitor = usePermission('auth:login');
  const [isLoginDialogVisible, setIsLoginDialogVisible] = useState(false);

  if (!canCreate && !isVisitor) return null;

  const onPress = () => {
    if (canCreate) router.push('/sightings/new');
    else setIsLoginDialogVisible(true);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={SIGHTINGS_LABELS.newReport}
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: theme.primary, shadowColor: theme.primary },
          pressed && styles.pressed,
        ]}>
        <Icon name="writeReport" size={24} color="onPrimary" />
      </Pressable>
      <LoginRequiredDialog
        isVisible={isLoginDialogVisible}
        onClose={() => setIsLoginDialogVisible(false)}
        onLogin={() => {
          setIsLoginDialogVisible(false);
          router.push('/login');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.three,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
  },
});
