import { type BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Tamaño del ícono de cada pestaña en el diseño. */
export const TAB_ICON_SIZE = 28;

/**
 * Barra inferior del diseño de Figma (HE-3, "Listar fichas" → `bottom-nav`): fondo neutro-100 con
 * esquinas superiores redondeadas, ícono de 28 px sobre la etiqueta y color green-700 en la pestaña
 * activa. Cada pantalla define su etiqueta (`title`) y su ícono (`tabBarIcon`) en el layout.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          backgroundColor: theme.backgroundSelected,
          paddingBottom: Math.max(insets.bottom, Spacing.three),
        },
      ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = options.title ?? route.name;
        const color = isFocused ? theme.navActive : theme.navInactive;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
            {options.tabBarIcon?.({ focused: isFocused, color, size: TAB_ICON_SIZE })}
            <ThemedText
              type="caption"
              style={[styles.label, { color }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}>
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 36,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  item: {
    alignItems: 'center',
    minWidth: MinTouchSize,
    minHeight: MinTouchSize,
  },
  label: {
    fontSize: 13,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.7,
  },
});
