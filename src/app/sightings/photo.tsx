import { Redirect, useLocalSearchParams } from 'expo-router';

import { PhotoViewerScreen } from '@/features/sightings';

/** `uris` llega como JSON (lista de URLs de la galería); un valor inválido se ignora. */
function parseUris(value: string | undefined): string[] | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')
      ? parsed
      : undefined;
  } catch {
    return undefined;
  }
}

/** Visor de la foto de un reporte, a pantalla completa con zoom. Recibe la URL pública de la foto. */
export default function SightingPhotoRoute() {
  const { uri, uris } = useLocalSearchParams<{ uri?: string; uris?: string }>();
  // Enlace sin foto (p. ej. un deep link incompleto): se vuelve al foro.
  if (typeof uri !== 'string' || uri.length === 0) return <Redirect href="/community" />;
  return <PhotoViewerScreen uri={uri} uris={parseUris(uris)} />;
}
