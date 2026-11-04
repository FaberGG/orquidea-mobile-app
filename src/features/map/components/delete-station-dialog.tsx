import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { STATION_LABELS } from '../constants';

export type DeleteStationDialogProps = {
  isVisible: boolean;
  isDeleting: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** HU-13 CA5: confirmación de ELIMINAR. CANCELAR cierra el aviso y deja la estación sin cambios. */
export function DeleteStationDialog({
  isVisible,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeleteStationDialogProps) {
  const theme = useTheme();
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={STATION_LABELS.cancel}
          onPress={onCancel}
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.scrim }]}
        />
        <View
          accessibilityViewIsModal
          style={[styles.dialog, { backgroundColor: theme.background }]}>
          <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
            <Icon name="delete" size={26} color="danger" />
          </View>
          <ThemedText style={styles.title} themeColor="textLabel" accessibilityRole="header">
            {STATION_LABELS.deleteTitle}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
            {STATION_LABELS.deleteDescription}
          </ThemedText>
          {errorMessage !== undefined && <FormMessage message={errorMessage} />}
          <View style={styles.actions}>
            <Button label={STATION_LABELS.confirm} onPress={onConfirm} isLoading={isDeleting} />
            <Button
              label={STATION_LABELS.cancel}
              variant="secondary"
              onPress={onCancel}
              disabled={isDeleting}
            />
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
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
});
