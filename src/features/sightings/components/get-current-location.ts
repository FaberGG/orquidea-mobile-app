import * as Location from 'expo-location';

import { type Coordinates } from '../types';

export type GetCurrentLocationResult =
  { status: 'located'; coordinates: Coordinates } | { status: 'denied' } | { status: 'error' };

/**
 * Pide permiso de ubicación (solo en primer plano) y lee la posición actual. Se usa como "lugar del
 * avistamiento": quien reporta suele estar en el humedal. El selector en un mapa queda pendiente hasta
 * que exista el mapa del sendero (HE-05).
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
    if (__DEV__) console.warn('[avistamientos] no se pudo obtener la ubicación', error);
    return { status: 'error' };
  }
}
