import { ActivityIndicator, StyleSheet, View } from 'react-native';

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
 */
export function SpeciesOfflineStatus() {
  const theme = useTheme();
  const connectivity = useConnectivity();
  const { phase, files } = useOfflineSyncStatus();

  const offline = connectivity === 'offline';
  const downloading = !offline && phase === 'syncing' && files.total > 0;
  if (!offline && !downloading) return null;

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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  text: {
    flexShrink: 1,
  },
});
