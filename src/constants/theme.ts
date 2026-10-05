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
  neutro200: '#D3D9D7',
  neutro300: '#ACB9B5',
  neutro400: '#7E958E',
  neutro500: '#60766F',
  neutro600: '#3D514B',
  neutro700: '#293D37',
  neutro800: '#152822',
  neutro900: '#072219',
  neutroBlack: '#000F0A',
  green50: '#E7F1EE',
  green100: '#B3D2C9',
  green200: '#8FBDAF',
  green300: '#5C9F8A',
  green400: '#3C8C73',
  green500: '#0B6F50',
  green600: '#0A6549',
  green700: '#084F39',
  green800: '#063D2C',
  green900: '#052F22',
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
    success: Palette.green500,
    successBackground: Palette.green50,
    border: Palette.neutro100,
    /** Fondo suave con el tono de marca (avatar, resaltados). */
    primarySoft: Palette.green50,
    /** Ícono y etiqueta de la pestaña activa / inactiva (Figma: green-700 / neutro-500). */
    navActive: Palette.green700,
    navInactive: Palette.neutro500,
    /** Velo detrás del menú lateral. */
    scrim: 'rgba(7, 34, 25, 0.4)',
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
    success: Palette.green200,
    successBackground: Palette.green800,
    border: Palette.neutro600,
    primarySoft: Palette.green800,
    navActive: Palette.green200,
    navInactive: Palette.neutro300,
    scrim: 'rgba(0, 15, 10, 0.6)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Familias de Nunito (tipografía del diseño). Se cargan en `useAppFonts`. */
export const FontFamily = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
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
  /** Tarjetas de contenido (Figma: listado de fichas). */
  card: 20,
  /** Círculos y chips completamente redondeados. */
  full: 999,
} as const;

/** Tamaño mínimo de un área táctil (CODIGO §7). */
export const MinTouchSize = 44;

export const MaxContentWidth = 800;
