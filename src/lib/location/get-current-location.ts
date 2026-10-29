import * as Location from 'expo-location';

/** Posición en grados decimales (WGS84), como `decimalLatitude` / `decimalLongitude` de la API. */
export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type GetCurrentLocationResult =
  { status: 'located'; coordinates: Coordinates } | { status: 'denied' } | { status: 'error' };

/**
 * Pide permiso de ubicación (solo en primer plano) y lee la posición actual (ADR-0013). La usan el lugar
 * de un avistamiento (HU-18) y las coordenadas de una estación (HU-13).
 */
export async function getCurrentLocation(): Promise<GetCurrentLocationResult> {
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return { status: 'denied' };
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      status: 'located',
      coordinates: { latitude: coords.latitude, longitude: coords.longitude },
    };
  } catch (error) {
    // GPS apagado o sin señal: quien llama muestra un mensaje genérico y el campo queda vacío.
    if (__DEV__) console.warn('[ubicación] no se pudo obtener la posición actual', error);
    return { status: 'error' };
  }
}
