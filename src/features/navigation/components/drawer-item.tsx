import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { FontFamily, MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { NAVIGATION_LABELS } from '../constants';

type DrawerItemProps = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  /** Destino aún no implementado: se muestra, pero no es presionable. */
  isComingSoon?: boolean;
};

/** Fila del menú lateral: ícono y etiqueta; debajo, "Próximamente" si aún no tiene ruta, o una flecha si la tiene. */
export function DrawerItem({ icon, label, onPress, isComingSoon = false }: DrawerItemProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isComingSoon ? `${label}, ${NAVIGATION_LABELS.comingSoon}` : label}
      accessibilityState={{ disabled: isComingSoon }}
      disabled={isComingSoon}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed && { backgroundColor: theme.backgroundSelected },
      ]}>
      <Icon name={icon} size={22} color="navInactive" />
      <View style={styles.text}>
        <ThemedText style={styles.label} themeColor="textLabel">
          {label}
        </ThemedText>
        {isComingSoon && (
          <ThemedText type="caption" themeColor="textMuted">
            {NAVIGATION_LABELS.comingSoon}
          </ThemedText>
        )}
      </View>
      {!isComingSoon && <Icon name="chevronRight" size={18} color="textMuted" />}
    </Pressable>
  );
}

type DrawerSectionProps = {
  title: string;
  children: ReactNode;
};

/** Grupo de filas del menú lateral con un título discreto. */
export function DrawerSection({ title, children }: DrawerSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText
        type="captionBold"
        themeColor="textMuted"
        style={styles.sectionTitle}
        accessibilityRole="header">
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: MinTouchSize + Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
  },
  text: {
    flex: 1,
    paddingVertical: Spacing.two,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  section: {
    gap: Spacing.one,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
  },
});
