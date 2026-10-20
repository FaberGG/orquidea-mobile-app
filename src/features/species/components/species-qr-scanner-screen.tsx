import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useIsFocused, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useTheme } from '@/hooks/use-theme';
import { isApiError } from '@/lib/api';

import { SPECIES_QR_LABELS } from '../constants';
import { useQrResolution } from '../hooks/use-qr-resolution';
import { parseSpeciesQr } from '../utils/parse-species-qr';

const ZOOM_STEPS = 5;

export function SpeciesQrScannerScreen() {
  const router = useRouter();
  const focused = useIsFocused();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission, refreshPermission] = useCameraPermissions();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const [torchOn, setTorchOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [pendingSpeciesId, setPendingSpeciesId] = useState<string | null>(null);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const handled = useRef(false);
  const active = useRef(false);
  const requestGeneration = useRef(0);
  const loadingRef = useRef(false);
  const pendingSpeciesIdRef = useRef<string | null>(null);
  const interruptedRequestRef = useRef(false);
  const { resolve, cancel } = useQrResolution();
  const { refresh: refreshNetworkStatus } = useNetworkStatus();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setAppActive(state === 'active');
      if (state === 'active') {
        void refreshPermission();
        void refreshNetworkStatus();
      } else {
        if (loadingRef.current && pendingSpeciesIdRef.current) {
          requestGeneration.current += 1;
          loadingRef.current = false;
          void cancel();
          setLoading(false);
          setMessage(SPECIES_QR_LABELS.loadError);
        }
        setTorchOn(false);
        setCameraReady(false);
      }
    });
    return () => subscription.remove();
  }, [cancel, refreshNetworkStatus, refreshPermission]);

  useEffect(() => {
    const wasActive = active.current;
    active.current = focused && appActive && permission?.granted === true;
    if (!active.current && wasActive) {
      requestGeneration.current += 1;
      if (loadingRef.current && pendingSpeciesIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
        setMessage(SPECIES_QR_LABELS.loadError);
      }
      void cancel();
    }
  }, [appActive, cancel, focused, permission?.granted]);

  useFocusEffect(
    useCallback(() => {
      handled.current = false;
      setLoading(false);
      setCameraError(false);
      setCameraReady(false);
      setTorchOn(false);
      setZoomLevel(0);
      setPermissionNotice(null);
      if (interruptedRequestRef.current && pendingSpeciesIdRef.current) {
        setPendingSpeciesId(pendingSpeciesIdRef.current);
        setMessage(SPECIES_QR_LABELS.loadError);
        interruptedRequestRef.current = false;
      } else {
        setMessage(null);
        setPendingSpeciesId(null);
        pendingSpeciesIdRef.current = null;
      }
      void refreshPermission();
      return () => {
        if (loadingRef.current && pendingSpeciesIdRef.current) {
          interruptedRequestRef.current = true;
          loadingRef.current = false;
        }
        requestGeneration.current += 1;
        active.current = false;
        handled.current = false;
        void cancel();
      };
    }, [cancel, refreshPermission]),
  );

  const resolveSpecies = async (id: string) => {
    const generation = ++requestGeneration.current;
    const isCurrent = () => generation === requestGeneration.current && active.current;
    pendingSpeciesIdRef.current = id;
    setPendingSpeciesId(id);
    setMessage(null);
    setTorchOn(false);
    const connectivity = await refreshNetworkStatus();
    if (!isCurrent()) return;
    if (connectivity === 'offline') {
      setMessage(SPECIES_QR_LABELS.offline);
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    try {
      await resolve(id);
      if (isCurrent()) router.push({ pathname: '/species/[id]', params: { id, source: 'qr' } });
    } catch (error) {
      if (!isCurrent()) return;
      if (isApiError(error) && error.status === 404) {
        setMessage(SPECIES_QR_LABELS.notFound);
      } else {
        const currentConnectivity = await refreshNetworkStatus();
        if (!isCurrent()) return;
        setMessage(
          currentConnectivity === 'offline'
            ? SPECIES_QR_LABELS.offline
            : SPECIES_QR_LABELS.loadError,
        );
      }
    } finally {
      if (generation === requestGeneration.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  };

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (handled.current) return;
    handled.current = true;
    const id = parseSpeciesQr(data);
    if (!id) {
      setMessage(SPECIES_QR_LABELS.invalidQr);
      return;
    }
    await resolveSpecies(id);
  };

  const scanAgain = () => {
    requestGeneration.current += 1;
    loadingRef.current = false;
    interruptedRequestRef.current = false;
    pendingSpeciesIdRef.current = null;
    void cancel();
    handled.current = false;
    setPendingSpeciesId(null);
    setMessage(null);
    setLoading(false);
    setCameraError(false);
    setCameraReady(false);
    setTorchOn(false);
    setZoomLevel(0);
    setCameraKey((key) => key + 1);
  };

  const closeScanner = () => {
    requestGeneration.current += 1;
    loadingRef.current = false;
    interruptedRequestRef.current = false;
    pendingSpeciesIdRef.current = null;
    active.current = false;
    handled.current = true;
    setTorchOn(false);
    void cancel();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const openSettings = async () => {
    setPermissionNotice(null);
    try {
      await Linking.openSettings();
    } catch {
      setPermissionNotice(SPECIES_QR_LABELS.settingsError);
    }
  };

  const askPermission = async () => {
    setPermissionNotice(null);
    try {
      await requestPermission();
    } catch {
      setPermissionNotice(SPECIES_QR_LABELS.cameraError);
    }
  };

  if (!permission) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator
          color={theme.primary}
          accessibilityRole="progressbar"
          accessibilityLabel={SPECIES_QR_LABELS.permissionChecking}
        />
      </ThemedView>
    );
  }

  const safeAreaStyle = {
    paddingTop: insets.top + Spacing.two,
    paddingBottom: insets.bottom + Spacing.two,
  };

  if (!permission.granted) {
    return (
      <ThemedView style={[styles.screen, safeAreaStyle]}>
        <EmptyState icon="wetland" title={SPECIES_QR_LABELS.permissionTitle}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
            {permission.canAskAgain
              ? SPECIES_QR_LABELS.permissionDescription
              : SPECIES_QR_LABELS.permissionBlocked}
          </ThemedText>
          {permission.canAskAgain ? (
            <Button label={SPECIES_QR_LABELS.allowCamera} onPress={() => void askPermission()} />
          ) : (
            <Button label={SPECIES_QR_LABELS.openSettings} onPress={() => void openSettings()} />
          )}
          {permissionNotice ? (
            <ThemedText
              type="small"
              themeColor="danger"
              style={styles.centerText}
              accessibilityRole="alert">
              {permissionNotice}
            </ThemedText>
          ) : null}
          <Button label={SPECIES_QR_LABELS.close} onPress={closeScanner} variant="link" />
        </EmptyState>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.screen, safeAreaStyle]}>
      <ThemedText
        type="title"
        style={styles.title}
        accessibilityRole="header"
        numberOfLines={1}
        adjustsFontSizeToFit>
        {SPECIES_QR_LABELS.title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.instruction}>
        {SPECIES_QR_LABELS.instruction}
      </ThemedText>
      <View style={styles.cameraFrame}>
        {focused && appActive && !loading && !message && !cameraError && (
          <CameraView
            key={cameraKey}
            style={StyleSheet.absoluteFill}
            facing="back"
            zoom={zoomLevel / ZOOM_STEPS}
            enableTorch={torchOn}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onBarcodeScanned}
            onCameraReady={() => setCameraReady(true)}
            onMountError={() => {
              setCameraError(true);
              setCameraReady(false);
              setTorchOn(false);
            }}
          />
        )}
        {!loading && !message && !cameraError ? (
          <View pointerEvents="none" style={styles.scanWindow} />
        ) : null}
      </View>
      {cameraReady && !loading && !message && !cameraError ? (
        <View style={styles.zoomControls}>
          <ThemedText type="captionBold" themeColor="textSecondary">
            Zoom
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Alejar cámara"
            accessibilityState={{ disabled: zoomLevel === 0 }}
            disabled={zoomLevel === 0}
            onPress={() => setZoomLevel((level) => Math.max(0, level - 1))}
            style={({ pressed }) => [
              styles.zoomButton,
              { borderColor: theme.border, backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
              zoomLevel === 0 && styles.disabled,
            ]}>
            <ThemedText type="subtitle" themeColor="textSecondary" style={styles.zoomButtonText}>
              −
            </ThemedText>
          </Pressable>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Nivel de zoom"
            accessibilityValue={{ min: 0, max: ZOOM_STEPS, now: zoomLevel }}
            style={styles.zoomMeter}>
            {Array.from({ length: ZOOM_STEPS }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.zoomSegment,
                  { backgroundColor: index < zoomLevel ? theme.primary : theme.border },
                ]}
              />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Acercar cámara"
            accessibilityState={{ disabled: zoomLevel === ZOOM_STEPS }}
            disabled={zoomLevel === ZOOM_STEPS}
            onPress={() => setZoomLevel((level) => Math.min(ZOOM_STEPS, level + 1))}
            style={({ pressed }) => [
              styles.zoomButton,
              { borderColor: theme.border, backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
              zoomLevel === ZOOM_STEPS && styles.disabled,
            ]}>
            <ThemedText type="subtitle" themeColor="textSecondary" style={styles.zoomButtonText}>
              +
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
      {cameraError ? (
        <View style={styles.message} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <ThemedText type="small" themeColor="textLabel" style={styles.centerText}>
            {SPECIES_QR_LABELS.cameraError}
          </ThemedText>
          <Button label={SPECIES_QR_LABELS.retry} onPress={scanAgain} />
        </View>
      ) : null}
      {!cameraReady && !loading && !message && !cameraError ? (
        <View accessibilityLiveRegion="polite">
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
            {SPECIES_QR_LABELS.cameraStarting}
          </ThemedText>
        </View>
      ) : null}
      {cameraReady && !loading && !message && !cameraError ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            torchOn ? SPECIES_QR_LABELS.flashlightOff : SPECIES_QR_LABELS.flashlightOn
          }
          accessibilityState={{ selected: torchOn }}
          onPress={() => setTorchOn((on) => !on)}
          style={styles.flashlight}>
          <Icon name="flashlight" size={18} color="primary" />
          <ThemedText type="smallSemiBold" themeColor="primary">
            {torchOn ? SPECIES_QR_LABELS.flashlightOff : SPECIES_QR_LABELS.flashlightOn}
          </ThemedText>
        </Pressable>
      ) : null}
      {loading && (
        <View
          style={styles.message}
          accessibilityRole="progressbar"
          accessibilityLabel={SPECIES_QR_LABELS.loading}
          accessibilityLiveRegion="polite">
          <ActivityIndicator color={theme.primary} />
          <ThemedText type="small" themeColor="textSecondary">
            {SPECIES_QR_LABELS.loading}
          </ThemedText>
        </View>
      )}
      {message ? (
        <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.message}>
          <ThemedText type="small" themeColor="textLabel" style={styles.centerText}>
            {message}
          </ThemedText>
          {pendingSpeciesId && message !== SPECIES_QR_LABELS.notFound ? (
            <Button
              label={SPECIES_QR_LABELS.retry}
              onPress={() => {
                handled.current = true;
                void resolveSpecies(pendingSpeciesId);
              }}
            />
          ) : null}
          <Button label={SPECIES_QR_LABELS.scanAgain} onPress={scanAgain} variant="link" />
        </View>
      ) : null}
      <Pressable
        onPress={closeScanner}
        accessibilityRole="button"
        accessibilityLabel={SPECIES_QR_LABELS.close}
        style={styles.back}>
        <Icon name="chevronLeft" size={18} color="primary" />
        <ThemedText type="smallSemiBold" themeColor="primary">
          {SPECIES_QR_LABELS.close}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: Spacing.four, gap: Spacing.three },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center', fontSize: 28, lineHeight: 34 },
  instruction: { textAlign: 'center' },
  zoomControls: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
  },
  zoomButtonText: { fontSize: 25, lineHeight: 30 },
  zoomMeter: { width: 88, flexDirection: 'row', alignItems: 'center', gap: 4 },
  zoomSegment: { flex: 1, height: 5, borderRadius: Radius.full },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.35 },
  flashlight: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  centerText: { textAlign: 'center' },
  cameraFrame: {
    flex: 1,
    minHeight: 240,
    overflow: 'hidden',
    borderRadius: Radius.card,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanWindow: {
    width: '72%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: Radius.card,
  },
  message: { alignItems: 'center', gap: Spacing.two },
  back: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
});
