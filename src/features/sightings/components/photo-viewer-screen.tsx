import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Colors, Radius, Spacing } from '@/constants/theme';

import { SIGHTINGS_LABELS } from '../constants';

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
/** Distancia vertical (sin zoom) a partir de la cual soltar la foto cierra el visor. */
const DISMISS_DISTANCE = 120;
// El visor es siempre oscuro (como en Facebook o Instagram), sin importar el tema del teléfono.
const VIEWER_BACKGROUND = Colors.dark.background;

/** Limita el desplazamiento para que la foto ampliada no se salga de la pantalla. */
function clampOffset(offset: number, scale: number, size: number): number {
  'worklet';
  const max = (size * (scale - 1)) / 2;
  return Math.min(max, Math.max(-max, offset));
}

export type PhotoViewerScreenProps = {
  uri: string;
};

/**
 * Foto de un reporte a pantalla completa, sin recorte. Se amplía pellizcando o tocando dos veces y,
 * ampliada, se recorre arrastrando. Sin zoom, deslizarla hacia arriba o abajo cierra el visor.
 */
export function PhotoViewerScreen({ uri }: PhotoViewerScreenProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedOffsetX = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);

  const close = () => router.back();

  const reset = () => {
    'worklet';
    scale.set(withTiming(1));
    savedScale.set(1);
    offsetX.set(withTiming(0));
    offsetY.set(withTiming(0));
    savedOffsetX.set(0);
    savedOffsetY.set(0);
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.set(Math.min(MAX_SCALE, Math.max(0.8, savedScale.get() * event.scale)));
    })
    .onEnd(() => {
      if (scale.get() <= 1) {
        reset();
        return;
      }
      savedScale.set(scale.get());
      // Al reducir el zoom, la foto puede quedar desplazada de más: se vuelve a encuadrar.
      const x = clampOffset(offsetX.get(), scale.get(), width);
      const y = clampOffset(offsetY.get(), scale.get(), height);
      offsetX.set(withTiming(x));
      offsetY.set(withTiming(y));
      savedOffsetX.set(x);
      savedOffsetY.set(y);
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((event) => {
      if (savedScale.get() > 1) {
        offsetX.set(clampOffset(savedOffsetX.get() + event.translationX, scale.get(), width));
        offsetY.set(clampOffset(savedOffsetY.get() + event.translationY, scale.get(), height));
      } else {
        offsetY.set(event.translationY);
      }
    })
    .onEnd((event) => {
      if (savedScale.get() > 1) {
        savedOffsetX.set(offsetX.get());
        savedOffsetY.set(offsetY.get());
      } else if (Math.abs(event.translationY) > DISMISS_DISTANCE) {
        scheduleOnRN(close);
      } else {
        offsetY.set(withSpring(0));
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.get() > 1) {
        reset();
        return;
      }
      scale.set(withTiming(DOUBLE_TAP_SCALE));
      savedScale.set(DOUBLE_TAP_SCALE);
    });

  const gesture = Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan));

  const photoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.get() },
      { translateY: offsetY.get() },
      { scale: scale.get() },
    ],
  }));

  // Al arrastrar para cerrar, el fondo se aclara para anticipar el cierre.
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: savedScale.get() > 1 ? 1 : 1 - Math.min(Math.abs(offsetY.get()) / (height / 2), 0.7),
  }));

  return (
    <GestureHandlerRootView style={styles.flex}>
      <StatusBar style="light" />
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.flex, photoStyle]}>
          <Image
            source={{ uri }}
            style={styles.flex}
            contentFit="contain"
            accessibilityIgnoresInvertColors
            accessibilityLabel={SIGHTINGS_LABELS.photoHint}
          />
        </Animated.View>
      </GestureDetector>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={SIGHTINGS_LABELS.closePhoto}
        onPress={close}
        hitSlop={Spacing.two}
        style={[styles.closeButton, { top: insets.top + Spacing.two }]}>
        <Icon name="close" size={22} fixedColor={Colors.dark.text} />
      </Pressable>

      <View style={[styles.hint, { bottom: insets.bottom + Spacing.three }]} pointerEvents="none">
        <ThemedText type="caption" style={styles.hintText}>
          {SIGHTINGS_LABELS.photoHint}
        </ThemedText>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: VIEWER_BACKGROUND,
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.three,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.backgroundSelected,
  },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: Colors.dark.textSecondary,
  },
});
