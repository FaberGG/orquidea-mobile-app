import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Can } from '@/permissions';

import { SPECIES_QR_EXPORT_LABELS } from '../constants';
import { useSpeciesQr } from '../hooks/use-species-qr';

type SpeciesQrExportProps = { id: string; name: string };

/** La consulta autenticada no se inicia hasta la acción explícita de una persona autorizada. */
export function SpeciesQrExport(props: SpeciesQrExportProps) {
  return (
    <Can permission="species:download-qr">
      <QrExportContent key={props.id} {...props} />
    </Can>
  );
}

function QrExportContent({ id, name }: SpeciesQrExportProps) {
  const theme = useTheme();
  const { uri, isPreparing, isSharing, errorMessage, prepare, share } = useSpeciesQr(id);

  return (
    <View style={[styles.panel, { borderColor: theme.border }]}>
      <ThemedText type="smallBold" accessibilityRole="header">
        {SPECIES_QR_EXPORT_LABELS.title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {SPECIES_QR_EXPORT_LABELS.description}
      </ThemedText>
      {uri && (
        <Image
          source={{ uri }}
          style={styles.qr}
          contentFit="contain"
          accessibilityLabel={`${SPECIES_QR_EXPORT_LABELS.preview} ${name}`}
          accessible
        />
      )}
      {errorMessage && <FormMessage message={errorMessage} />}
      {uri ? (
        <Button
          label={isSharing ? SPECIES_QR_EXPORT_LABELS.sharing : SPECIES_QR_EXPORT_LABELS.share}
          accessibilityLabel={SPECIES_QR_EXPORT_LABELS.share}
          isLoading={isSharing}
          onPress={share}
        />
      ) : (
        <Button
          label={isPreparing ? SPECIES_QR_EXPORT_LABELS.loading : SPECIES_QR_EXPORT_LABELS.generate}
          accessibilityLabel={SPECIES_QR_EXPORT_LABELS.generate}
          isLoading={isPreparing}
          onPress={prepare}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.three,
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.medium,
  },
  qr: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1,
    alignSelf: 'center',
  },
});
