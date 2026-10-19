import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { getInitials } from './format-sighting';

const AVATAR_SIZE = 40;

export type SightingAuthorProps = {
  name: string;
  /** Segunda línea: fecha del reporte o su estado ("Pendiente de revisión"). */
  subtitle: string | null;
};

/**
 * Autor de un reporte (Figma: "Autor"). La API no expone foto de perfil, así que el retrato se
 * reemplaza por las iniciales sobre el verde suave de la marca.
 */
export function SightingAuthor({ name, subtitle }: SightingAuthorProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]} aria-hidden>
        <ThemedText style={styles.initials} themeColor="primary">
          {getInitials(name)}
        </ThemedText>
      </View>
      <View style={styles.info}>
        <ThemedText type="smallBold" themeColor="textLabel" numberOfLines={1}>
          {name}
        </ThemedText>
        {subtitle !== null && (
          <ThemedText style={styles.subtitle} themeColor="textMuted" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
