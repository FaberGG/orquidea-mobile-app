import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SIGHTINGS_LABELS } from '../constants';

export type LoginRequiredDialogProps = {
  isVisible: boolean;
  onLogin: () => void;
  onClose: () => void;
};

/**
 * Aviso para el visitante que intenta escribir un reporte: debe iniciar sesión (HU-18 es solo para
 * usuarios registrados). Lleva a la pantalla de inicio de sesión.
 */
export function LoginRequiredDialog({ isVisible, onLogin, onClose }: LoginRequiredDialogProps) {
  const theme = useTheme();
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={SIGHTINGS_LABELS.notNow}
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.scrim }]}
        />
        <View
          accessibilityViewIsModal
          style={[styles.dialog, { backgroundColor: theme.background }]}>
          <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
            <Icon name="login" size={28} color="primary" />
          </View>
          <ThemedText style={styles.title} themeColor="textLabel" accessibilityRole="header">
            {SIGHTINGS_LABELS.loginRequiredTitle}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
            {SIGHTINGS_LABELS.loginRequiredDescription}
          </ThemedText>
          <View style={styles.actions}>
            <Button label={SIGHTINGS_LABELS.loginButton} onPress={onLogin} />
            <Button label={SIGHTINGS_LABELS.notNow} variant="link" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radius.card,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
});
