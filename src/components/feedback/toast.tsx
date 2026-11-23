import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** `info`: avisos neutros del estado de la app (p. ej. conexión). */
export type ToastVariant = 'success' | 'error' | 'info';

export type ToastOptions = {
  /** Tiempo en pantalla antes de cerrarse solo. Por defecto 4 s. */
  durationMs?: number;
};

type ToastContextValue = {
  /** Muestra un aviso breve arriba de la pantalla; uno nuevo reemplaza al anterior. */
  show: (message: string, variant?: ToastVariant, options?: ToastOptions) => void;
};

/** Sin `ToastProvider` (p. ej. en pruebas de un componente suelto) mostrar un aviso no hace nada. */
const ToastContext = createContext<ToastContextValue>({ show: () => undefined });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const DURATION_MS = 4000;
const ENTER_MS = 220;
const EXIT_MS = 180;
const SLIDE_DISTANCE = 24;
const MAX_WIDTH = 420;
const CLOSE_LABEL = 'Cerrar aviso';

type ToastState = { id: number; message: string; variant: ToastVariant };

/**
 * Avisos informativos que no bloquean la pantalla: aparecen arriba, con margen respecto a los bordes, y se
 * cierran solos o con su botón X.
 * Se monta una sola vez, en `AppProviders`.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [leaving, setLeaving] = useState(false);
  const nextId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    // El aviso sale con su animación (`ToastCard` llama a `onHidden` al terminar).
    setLeaving(true);
  }, []);
  const clear = useCallback(() => {
    setToast(null);
    setLeaving(false);
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'success', options: ToastOptions = {}) => {
      if (timer.current) clearTimeout(timer.current);
      nextId.current += 1;
      setLeaving(false);
      setToast({ id: nextId.current, message, variant });
      timer.current = setTimeout(dismiss, options.durationMs ?? DURATION_MS);
      // Android lo anuncia con `accessibilityLiveRegion`; iOS necesita el anuncio explícito.
      if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext value={value}>
      <View style={styles.root}>
        {children}
        {toast && (
          <ToastCard
            key={toast.id}
            toast={toast}
            leaving={leaving}
            onPress={dismiss}
            onHidden={clear}
          />
        )}
      </View>
    </ToastContext>
  );
}

function ToastCard({
  toast,
  leaving,
  onPress,
  onHidden,
}: {
  toast: ToastState;
  leaving: boolean;
  onPress: () => void;
  onHidden: () => void;
}) {
  const theme = useTheme();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: leaving ? 0 : 1,
      duration: leaving ? EXIT_MS : ENTER_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && leaving) onHidden();
    });
  }, [leaving, onHidden, progress]);

  const insets = useSafeAreaInsets();
  const isError = toast.variant === 'error';
  const isInfo = toast.variant === 'info';

  return (
    <View pointerEvents="box-none" style={[styles.overlay, { top: insets.top + Spacing.three }]}>
      <Animated.View
        style={{
          width: '100%',
          maxWidth: MAX_WIDTH,
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-SLIDE_DISTANCE, 0],
              }),
            },
          ],
        }}>
        <View
          accessibilityRole={isError ? 'alert' : 'summary'}
          accessibilityLiveRegion="polite"
          style={[
            styles.card,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: isError ? theme.danger : theme.border,
              shadowColor: theme.text,
            },
          ]}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isError
                  ? theme.dangerBackground
                  : isInfo
                    ? theme.backgroundSelected
                    : theme.successBackground,
              },
            ]}>
            <Icon
              name={isError || isInfo ? 'info' : 'check'}
              size={18}
              color={isError ? 'danger' : isInfo ? 'textLabel' : 'success'}
            />
          </View>
          <ThemedText type="small" themeColor="textLabel" style={styles.message}>
            {toast.message}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CLOSE_LABEL}
            onPress={onPress}
            hitSlop={Spacing.two}
            style={({ pressed }) => [styles.close, pressed && styles.closePressed]}>
            <Icon name="close" size={18} color="textSecondary" />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + Spacing.one,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.pill,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: {
    opacity: 0.6,
  },
});
