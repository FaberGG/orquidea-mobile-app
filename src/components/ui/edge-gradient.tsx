import { type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export type EdgeGradientProps = {
  /** Borde donde el degradado es más oscuro; hacia el otro lado se desvanece. */
  edge: 'top' | 'bottom';
  /** Opacidad del negro en el borde (0 a 1). */
  intensity?: number;
  style?: StyleProp<ViewStyle>;
};

let nextId = 0;

/**
 * Degradado negro que se desvanece, para dar contraste a textos y botones sobre una foto sin oscurecerla
 * entera. Posiciónalo con `style` (`position: 'absolute'`, alto y bordes).
 */
export function EdgeGradient({ edge, intensity = 0.45, style }: EdgeGradientProps) {
  const id = `edge-gradient-${nextId++}`;
  const start = edge === 'top' ? intensity : 0;
  const end = edge === 'top' ? 0 : intensity;
  return (
    <Svg style={style} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity={start} />
          <Stop offset="1" stopColor="#000000" stopOpacity={end} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
