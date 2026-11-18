import { Platform } from 'react-native';

/**
 * Indica si es seguro montar el mapa nativo.
 *
 * En Android `react-native-maps` usa Google Maps, y el SDK cierra la app (excepción nativa en el hilo de
 * UI, imposible de atrapar desde JS) si el manifiesto no tiene una API key. Por eso se decide ANTES de
 * renderizar `MapView`. La misma variable alimenta `app.config.ts`, así que la key del binario y esta
 * comprobación no pueden desincronizarse. En iOS y en otras plataformas no depende de ninguna key.
 *
 * Se lee con notación de punto para que Expo inlinee `EXPO_PUBLIC_*` (ver `src/config/README.md`).
 */
export function isNativeMapAvailable(
  platform: string = Platform.OS,
  googleMapsApiKey: string | undefined = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
): boolean {
  if (platform !== 'android') return true;
  return typeof googleMapsApiKey === 'string' && googleMapsApiKey.trim() !== '';
}
