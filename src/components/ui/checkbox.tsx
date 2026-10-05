import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CheckboxProps = {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  /** Texto que acompaña la casilla; también se usa como nombre accesible si es string. */
  children: ReactNode;
  accessibilityLabel?: string;
  hasError?: boolean;
};

const BOX_SIZE = 14;

/** Casilla de verificación con texto (diseño: borde verde de 14 px y radio 4). */
export function Checkbox({
  isChecked,
  onChange,
  children,
  accessibilityLabel,
  hasError = false,
}: CheckboxProps) {
  const theme = useTheme();
  const borderColor = hasError ? theme.danger : theme.primary;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onChange(!isChecked)}
      style={styles.row}>
      <View
        style={[
          styles.box,
          { borderColor, backgroundColor: isChecked ? theme.primary : 'transparent' },
        ]}>
        {isChecked && <Icon name="check" size={11} color="onPrimary" />}
      </View>
      <View style={styles.label}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    // Área táctil mínima (CODIGO §7): la fila completa es presionable.
    minHeight: 44,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    marginLeft: Spacing.half,
  },
});
