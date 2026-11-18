import { type ConfigContext, type ExpoConfig } from 'expo/config';

/**
 * Extiende `app.json`. La API key de Google Maps (solo Android) se lee de EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
 * en `.env.local`, la misma variable que usa `isNativeMapAvailable` para decidir si monta el mapa.
 * Sin key, el manifiesto no la lleva y la app muestra un aviso en lugar del mapa.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  return {
    ...config,
    name: config.name ?? 'Orquídea',
    slug: config.slug ?? 'orquidea-mobile-app',
    android: {
      ...config.android,
      ...(googleMapsApiKey ? { config: { googleMaps: { apiKey: googleMapsApiKey } } } : {}),
    },
  };
};
