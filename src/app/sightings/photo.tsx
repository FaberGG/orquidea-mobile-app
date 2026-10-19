import { Redirect, useLocalSearchParams } from 'expo-router';

import { PhotoViewerScreen } from '@/features/sightings';

/** Visor de la foto de un reporte, a pantalla completa con zoom. Recibe la URL pública de la foto. */
export default function SightingPhotoRoute() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  // Enlace sin foto (p. ej. un deep link incompleto): se vuelve al foro.
  if (typeof uri !== 'string' || uri.length === 0) return <Redirect href="/community" />;
  return <PhotoViewerScreen uri={uri} />;
}
