import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HeaderIconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
};

/** Botón circular de 40 px del encabezado (Figma: fondo neutro-100, ícono de 24 px). */
export function HeaderIconButton({ icon, accessibilityLabel, onPress }: HeaderIconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={Spacing.one}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} color="textLabel" />
    </Pressable>
  );
}

export type AppHeaderProps = {
  onMenuPress: () => void;
  menuAccessibilityLabel: string;
  title?: string;
  /** Acción opcional a la derecha (p. ej. buscar en el listado de fichas). */
  right?: ReactNode;
};

/**
 * Encabezado de las pestañas principales (Figma: "Listar fichas"): botón de menú a la izquierda y una
 * acción opcional a la derecha. Cubre el área segura superior.
 */
export function AppHeader({ onMenuPress, menuAccessibilityLabel, title, right }: AppHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.background, paddingTop: insets.top + Spacing.three },
      ]}>
      <HeaderIconButton
        icon="menu"
        accessibilityLabel={menuAccessibilityLabel}
        onPress={onMenuPress}
      />
      {title && (
        <ThemedText type="default" style={styles.title} themeColor="textLabel" numberOfLines={1}>
          {title}
        </ThemedText>
      )}
      {right}
      {title && !right && <View style={styles.iconButton} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.bold,
  },
  pressed: {
    opacity: 0.7,
  },
});
