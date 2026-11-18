import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
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
/** Distancia horizontal (sin zoom) a partir de la cual soltar la foto pasa a la siguiente o anterior. */
const SWIPE_DISTANCE = 80;
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
  /** Todas las fotos de la galería (incluida `uri`): permite pasar a la anterior o siguiente deslizando. */
  uris?: string[];
};

/**
 * Foto de un reporte a pantalla completa, sin recorte. Se amplía pellizcando o tocando dos veces y,
 * ampliada, se recorre arrastrando. Sin zoom, deslizarla hacia arriba o abajo cierra el visor y, si hay
 * varias fotos, deslizarla hacia los lados pasa a la anterior o siguiente.
 */
export function PhotoViewerScreen({ uri, uris }: PhotoViewerScreenProps) {
  const gallery = uris && uris.length > 0 && uris.includes(uri) ? uris : [uri];
  const hasMany = gallery.length > 1;
  const initialIndex = Math.max(0, gallery.indexOf(uri));
  // `index` (estado) decide qué fotos están montadas; `pageIndex` y `base` viven en el hilo de animación.
  const [index, setIndex] = useState(initialIndex);
  const lastIndex = gallery.length - 1;

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const pageIndex = useSharedValue(initialIndex);
  /** Desplazamiento de la tira de fotos hasta la página actual (-índice × ancho). */
  const base = useSharedValue(-initialIndex * width);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedOffsetX = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);

  const close = () => router.back();
  const showPhoto = (target: number) => setIndex(target);

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
      } else if (hasMany && Math.abs(event.translationX) > Math.abs(event.translationY)) {
        offsetY.set(0);
        offsetX.set(event.translationX);
      } else {
        offsetX.set(0);
        offsetY.set(event.translationY);
      }
    })
    .onEnd((event) => {
      if (savedScale.get() > 1) {
        savedOffsetX.set(offsetX.get());
        savedOffsetY.set(offsetY.get());
      } else if (hasMany && Math.abs(event.translationX) > Math.abs(event.translationY)) {
        // Hacia la izquierda (translationX < 0) se ve la siguiente foto.
        const step = event.translationX < 0 ? 1 : -1;
        const target = pageIndex.get() + step;
        if (Math.abs(event.translationX) > SWIPE_DISTANCE && target >= 0 && target <= lastIndex) {
          offsetX.set(
            withTiming(-step * width, { duration: 180 }, (finished) => {
              if (!finished) return;
              // La tira queda donde estaba a la vista, pero ahora con la nueva foto como base: las dos
              // asignaciones ocurren juntas en el hilo de animación, así no hay un cuadro intermedio.
              base.set(base.get() - step * width);
              offsetX.set(0);
              pageIndex.set(target);
              scheduleOnRN(showPhoto, target);
            }),
          );
        } else {
          offsetX.set(withSpring(0));
        }
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

  // La tira completa se mueve con el dedo; el zoom solo afecta a cada foto sobre su propio centro.
  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: base.get() + offsetX.get() }, { translateY: offsetY.get() }],
  }));
  const zoomStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  // Las fotos vecinas solo se ven con la foto actual sin zoom (para deslizar entre fotos). Se decide con la
  // escala visible, no con la guardada: esa cambia al terminar el gesto, y mientras se pellizca por primera
  // vez o se anima el regreso de un doble toque la foto actual ya está ampliada.
  const neighborStyle = useAnimatedStyle(() => ({
    opacity: Math.abs(scale.get() - 1) < 0.01 ? 1 : 0,
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
        {/* Área táctil fija; la tira de fotos se mueve dentro de ella. */}
        <View style={styles.flex}>
          <Animated.View style={[styles.flex, stripStyle]}>
            {/* Solo la foto actual y sus vecinas, cada una en su lugar de la tira (índice × ancho). */}
            {gallery.map((photoUri, position) =>
              Math.abs(position - index) > 1 ? null : (
                <Animated.View
                  key={position}
                  style={[
                    styles.page,
                    { left: position * width, width },
                    // El zoom es solo de la foto actual; las vecinas no se amplían.
                    position === index ? zoomStyle : neighborStyle,
                  ]}>
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.flex}
                    contentFit="contain"
                    accessibilityIgnoresInvertColors
                    accessibilityLabel={position === index ? SIGHTINGS_LABELS.photoHint : undefined}
                  />
                </Animated.View>
              ),
            )}
          </Animated.View>
        </View>
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
          {hasMany ? `${index + 1}/${gallery.length} · ` : ''}
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
  page: {
    position: 'absolute',
    top: 0,
    bottom: 0,
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
