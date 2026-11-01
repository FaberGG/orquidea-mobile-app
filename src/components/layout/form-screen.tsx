import { type ReactNode, useEffect, useRef } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export type FormScreenProps = {
  children: ReactNode;
  /** `true` si la pantalla muestra el encabezado del navegador (ya cubre el área segura superior). */
  hasNavigationHeader?: boolean;
};

const EDGES_WITH_HEADER: Edge[] = ['bottom', 'left', 'right'];
const ALL_EDGES: Edge[] = ['top', 'bottom', 'left', 'right'];

/** Espacio libre que se deja entre el campo enfocado y el borde superior del teclado. */
export const KEYBOARD_INPUT_MARGIN = Spacing.four;

type KeyboardOverlap = {
  /** Borde inferior del campo enfocado, en coordenadas de la ventana. */
  inputBottom: number;
  /** Alto de la ventana. */
  windowHeight: number;
  /** Alto del teclado abierto. */
  keyboardHeight: number;
};

/**
 * Cuánto hay que desplazar el formulario para que el campo enfocado quede encima del teclado, con un
 * margen. Devuelve 0 si el campo ya está a la vista.
 */
export function getKeyboardScrollDelta({
  inputBottom,
  windowHeight,
  keyboardHeight,
}: KeyboardOverlap): number {
  const visibleBottom = windowHeight - keyboardHeight - KEYBOARD_INPUT_MARGIN;
  return Math.max(0, inputBottom - visibleBottom);
}

/**
 * Contenedor de pantallas de formulario: área segura, scroll y manejo del teclado.
 *
 * Acta 17: ningún campo debe quedar tapado por el teclado. En Android (siempre de borde a borde) la
 * ventana ya no se encoge sola al abrir el teclado, así que el `KeyboardAvoidingView` agrega el espacio
 * en ambas plataformas; además, al abrirse el teclado se desplaza el formulario hasta el campo enfocado.
 */
export function FormScreen({ children, hasNavigationHeader = false }: FormScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', (event) => {
      const input = TextInput.State.currentlyFocusedInput();
      if (!input || !scrollRef.current) return;
      input.measureInWindow((_x, y, _width, height) => {
        const delta = getKeyboardScrollDelta({
          inputBottom: y + height,
          windowHeight: Dimensions.get('window').height,
          keyboardHeight: event.endCoordinates.height,
        });
        if (delta > 0) {
          scrollRef.current?.scrollTo({ y: scrollOffset.current + delta, animated: true });
        }
      });
    });
    return () => subscription.remove();
  }, []);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={hasNavigationHeader ? EDGES_WITH_HEADER : ALL_EDGES}>
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            onScroll={onScroll}
            scrollEventThrottle={16}>
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 28,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
