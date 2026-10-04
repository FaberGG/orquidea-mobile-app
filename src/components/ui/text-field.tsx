import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { FontFamily, MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  /** Ícono a la izquierda del texto. */
  icon?: IconName;
  /** Muestra el campo como contraseña, con botón para mostrar u ocultar el texto. */
  isPassword?: boolean;
  hasError?: boolean;
};

/** Campo de texto con etiqueta. El mensaje de error lo muestra quien lo usa (p. ej. `FormMessage`). */
export function TextField({
  label,
  icon,
  isPassword = false,
  hasError = false,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [isTextHidden, setIsTextHidden] = useState(true);

  return (
    <View style={styles.container}>
      <ThemedText type="label" themeColor="textLabel">
        {label}
      </ThemedText>
      <View
        style={[
          styles.inputRow,
          {
            borderColor: hasError ? theme.danger : theme.border,
            backgroundColor: theme.background,
          },
        ]}>
        {icon && <Icon name={icon} size={icon === 'email' ? 20 : 24} />}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={isPassword && isTextHidden}
          style={[styles.input, { color: theme.text }]}
          {...inputProps}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isTextHidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={Spacing.three}
            onPress={() => setIsTextHidden((hidden) => !hidden)}
            style={styles.toggle}>
            <Icon name={isTextHidden ? 'visibilityOff' : 'visibility'} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.pill,
    minHeight: MinTouchSize,
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    // Sin esto, en web el input conserva su ancho intrínseco y empuja el ícono del ojo fuera del borde.
    minWidth: 0,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  toggle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
