import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  /** Muestra el campo como contraseña, con botón para mostrar u ocultar el texto. */
  isPassword?: boolean;
  hasError?: boolean;
};

/** Campo de texto con etiqueta. El mensaje de error lo muestra quien lo usa (p. ej. `FormMessage`). */
export function TextField({
  label,
  isPassword = false,
  hasError = false,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [isTextHidden, setIsTextHidden] = useState(true);

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View
        style={[
          styles.inputRow,
          {
            borderColor: hasError ? theme.danger : theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={isPassword && isTextHidden}
          style={[styles.input, { color: theme.text }]}
          {...inputProps}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isTextHidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={Spacing.two}
            onPress={() => setIsTextHidden((hidden) => !hidden)}
            style={styles.toggle}>
            <ThemedText type="small" style={{ color: theme.primary }}>
              {isTextHidden ? 'Mostrar' : 'Ocultar'}
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.small,
    minHeight: MinTouchSize,
  },
  input: {
    flex: 1,
    // Sin esto, en web el input conserva su ancho intrínseco y empuja el botón Mostrar/Ocultar fuera del borde.
    minWidth: 0,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    fontFamily: Fonts?.sans,
  },
  toggle: {
    minHeight: MinTouchSize,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
});
