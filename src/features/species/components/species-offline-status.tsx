import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useConnectivity } from '@/hooks/use-connectivity';
import { useOfflineSyncStatus } from '@/hooks/use-offline-sync-status';
import { useTheme } from '@/hooks/use-theme';

import { SPECIES_OFFLINE_LABELS } from '../constants';

/**
 * HU-21: fila sobre el listado de fichas con el estado de la copia offline. Mientras se descargan fotos
 * muestra el progreso; sin conexión recuerda que se ven las fichas descargadas. En otro caso no ocupa espacio.
 * Se puede ocultar con su X; vuelve a aparecer la próxima vez que cambie el estado (p. ej. otra desconexión).
 */
export function SpeciesOfflineStatus() {
  const theme = useTheme();
  const connectivity = useConnectivity();
  const { phase, files } = useOfflineSyncStatus();

  const offline = connectivity === 'offline';
  const downloading = !offline && phase === 'syncing' && files.total > 0;
  const kind = offline ? 'offline' : downloading ? 'downloading' : null;

  const [dismissed, setDismissed] = useState(false);
  const [previousKind, setPreviousKind] = useState(kind);
  // Ajuste de estado al cambiar lo que se muestra (patrón de React, sin efecto): un aviso nuevo se ve otra vez.
  if (kind !== previousKind) {
    setPreviousKind(kind);
    setDismissed(false);
  }
  if (kind === null || dismissed) return null;

  return (
    <View
      style={[styles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
      accessibilityLiveRegion="polite">
      {downloading ? (
        <ActivityIndicator size="small" color={theme.primary} />
      ) : (
        <Icon name="offline" size={18} color="textSecondary" />
      )}
      <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
        {downloading
          ? SPECIES_OFFLINE_LABELS.syncing(files.done, files.total)
          : SPECIES_OFFLINE_LABELS.showingDownloaded}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={SPECIES_OFFLINE_LABELS.dismissStatus}
        onPress={() => setDismissed(true)}
        hitSlop={Spacing.two}
        style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
        <Icon name="close" size={18} color="textSecondary" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  text: {
    flex: 1,
  },
  close: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
