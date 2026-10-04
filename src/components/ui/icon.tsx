import { SymbolView } from 'expo-symbols';
import { type ComponentProps } from 'react';

import { type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

/**
 * Íconos de la app: SF Symbols en iOS y Material Symbols en Android/web (vía `expo-symbols`).
 * Cada ícono se nombra una sola vez aquí para no repetir los nombres por plataforma.
 */
const ICONS = {
  email: { ios: 'at', android: 'alternate_email', web: 'alternate_email' },
  password: { ios: 'asterisk', android: 'asterisk', web: 'asterisk' },
  visibility: { ios: 'eye', android: 'visibility', web: 'visibility' },
  visibilityOff: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
} as const satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: ThemeColor;
};

/** Ícono decorativo; si transmite información, quien lo usa debe darle `accessibilityLabel`. */
export function Icon({ name, size = 24, color = 'primary' }: IconProps) {
  const theme = useTheme();
  return <SymbolView name={ICONS[name]} size={size} tintColor={theme[color]} />;
}
