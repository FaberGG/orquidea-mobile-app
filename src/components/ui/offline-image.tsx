import { Image, type ImageProps } from 'expo-image';
import { type ReactNode, useState } from 'react';

import { useConnectivity } from '@/hooks/use-connectivity';
import { useLocalOfflineFileUri } from '@/hooks/use-offline-file-uri';

export type OfflineImageProps = Omit<ImageProps, 'source'> & {
  /** URL remota de la foto guardada en la API. */
  uri: string | null | undefined;
  /**
   * Qué mostrar si la foto no está en el dispositivo y no se puede cargar: sin conexión, o si falló la carga
   * remota (p. ej. hay red pero el servidor no responde). Sin esta prop se muestra la imagen vacía, como antes.
   */
  unavailableFallback?: ReactNode;
};

/**
 * `Image` de `expo-image` para fotos que vienen de la API: si la foto ya se descargó para uso offline
 * (HU-21) se muestra el archivo local; si no, la URL remota. No usar con fotos recién elegidas en el
 * dispositivo (ya son locales).
 */
export function OfflineImage({ uri, unavailableFallback, onError, ...props }: OfflineImageProps) {
  const local = useLocalOfflineFileUri(uri);
  const connectivity = useConnectivity();
  // Se recuerda qué URL falló y con qué conectividad: si cambia la URL o la conexión, se vuelve a intentar.
  const [failed, setFailed] = useState<{ uri: string; connectivity: string } | null>(null);
  const loadFailed = failed !== null && failed.uri === uri && failed.connectivity === connectivity;
  const resolved = local ?? uri ?? null;

  const unavailable =
    unavailableFallback !== undefined &&
    Boolean(uri) &&
    local === null &&
    (connectivity === 'offline' || loadFailed);
  if (unavailable) return <>{unavailableFallback}</>;

  return (
    <Image
      source={resolved ? { uri: resolved } : null}
      onError={(event) => {
        if (!local && uri) setFailed({ uri, connectivity });
        onError?.(event);
      }}
      {...props}
    />
  );
}
