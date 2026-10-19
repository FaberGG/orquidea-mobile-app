import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type InfoNoteProps = {
  text: string;
  /** Final del mensaje en negrita (Figma: "No se publicará de forma inmediata."). */
  boldText?: string;
};

/** Nota informativa verde con ícono (Figma: "nota-administracion"). */
export function InfoNote({ text, boldText }: InfoNoteProps) {
  const theme = useTheme();
  return (
    <View style={[styles.note, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
      <Icon name="info" size={16} color="navActive" />
      <ThemedText style={styles.text} themeColor="navActive">
        {text}
        {boldText && (
          <ThemedText style={styles.bold} themeColor="navActive">
            {boldText}
          </ThemedText>
        )}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: 12,
    borderWidth: 1,
    borderRadius: Radius.medium,
  },
  text: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  // Texto anidado: ThemedText aplica su tamaño por defecto, así que se repite el de la nota.
  bold: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 17,
  },
});
