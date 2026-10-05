import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type AuthFooterProps = {
  question: string;
  linkLabel: string;
  onPress: () => void;
};

/** Pie de las pantallas de acceso: pregunta en gris y enlace en verde, pegados abajo (diseño HE-1). */
export function AuthFooter({ question, linkLabel, onPress }: AuthFooterProps) {
  return (
    <View style={styles.footer}>
      <ThemedText type="smallSemiBold" themeColor="textMuted">
        {question}
      </ThemedText>
      <Pressable accessibilityRole="link" hitSlop={Spacing.three} onPress={onPress}>
        <ThemedText type="smallBold" themeColor="primary">
          {linkLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Con flexWrap, alignContent es lo que baja la línea al fondo de la pantalla.
    alignContent: 'flex-end',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
  },
});
