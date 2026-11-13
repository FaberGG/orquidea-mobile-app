import { Image, type ImageProps } from 'expo-image';

import { useOfflineFileUri } from '@/hooks/use-offline-file-uri';

export type OfflineImageProps = Omit<ImageProps, 'source'> & {
  /** URL remota de la foto guardada en la API. */
  uri: string | null | undefined;
};

/**
 * `Image` de `expo-image` para fotos que vienen de la API: si la foto ya se descargó para uso offline
 * (HU-21) se muestra el archivo local; si no, la URL remota. No usar con fotos recién elegidas en el
 * dispositivo (ya son locales).
 */
export function OfflineImage({ uri, ...props }: OfflineImageProps) {
  const resolved = useOfflineFileUri(uri);
  return <Image source={resolved ? { uri: resolved } : null} {...props} />;
}
