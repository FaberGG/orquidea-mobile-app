import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

import { Colors } from '@/constants/theme';

/**
 * Tema de navegación con los colores de la app. Con el tema por defecto de React Navigation (gris
 * claro / negro) el fondo del navegador asoma entre pantallas —parpadeo al entrar o retroceder— y
 * detrás de las esquinas redondeadas de la barra inferior.
 */
function buildTheme(base: Theme, colors: (typeof Colors)['light' | 'dark']): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };
}

export const lightNavigationTheme = buildTheme(DefaultTheme, Colors.light);
export const darkNavigationTheme = buildTheme(DarkTheme, Colors.dark);
