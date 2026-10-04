/** Tokens de diseño: colores (claro/oscuro), tipografía, espaciados y radios. */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * Paleta del diseño de Figma "Humedal Orquidea" (sección "Colores y componentes"):
 * escala `neutro/*` y `Foundation/Green/green-*`. El tema oscuro no está diseñado: se deriva de las
 * mismas escalas manteniendo contraste AA.
 */
const Palette = {
  neutroWhite: '#F7F8F8',
  neutro50: '#EFF1F0',
  neutro100: '#E3E8E6',
  neutro300: '#ACB9B5',
  neutro400: '#7E958E',
  neutro600: '#3D514B',
  neutro700: '#293D37',
  neutro800: '#152822',
  neutro900: '#072219',
  green200: '#8FBDAF',
  green500: '#0B6F50',
} as const;

export const Colors = {
  light: {
    text: Palette.neutro800,
    textSecondary: Palette.neutro600,
    textLabel: Palette.neutro700,
    textMuted: Palette.neutro400,
    background: Palette.neutroWhite,
    backgroundElement: Palette.neutro50,
    backgroundSelected: Palette.neutro100,
    primary: Palette.green500,
    onPrimary: Palette.neutroWhite,
    danger: '#B3261E',
    dangerBackground: '#FCEEEE',
    border: Palette.neutro100,
  },
  dark: {
    text: Palette.neutro50,
    textSecondary: Palette.neutro300,
    textLabel: Palette.neutro100,
    textMuted: Palette.neutro400,
    background: Palette.neutro900,
    backgroundElement: Palette.neutro800,
    backgroundSelected: Palette.neutro700,
    primary: Palette.green200,
    onPrimary: Palette.neutro900,
    danger: '#F2B8B5',
    dangerBackground: '#3A1614',
    border: Palette.neutro600,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Familias de Nunito (tipografía del diseño). Se cargan en `useAppFonts`. */
export const FontFamily = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Radios de borde de los componentes base. */
export const Radius = {
  small: 8,
  medium: 12,
  /** Campos y botones redondeados del diseño. */
  pill: 24,
} as const;

/** Tamaño mínimo de un área táctil (CODIGO §7). */
export const MinTouchSize = 44;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
