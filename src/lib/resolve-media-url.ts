import { getEnv } from '@/config';

const LOCAL_STORAGE_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'storage',
  'orquidea-storage',
]);

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false;
  }
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

/**
 * Reemplaza hosts locales o privados de Docker por el host LAN usado por la API.
 * Así el móvil puede descargar imágenes que el backend anuncia como localhost/storage.
 */
export function resolveMediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const apiUrl = new URL(getEnv().apiUrl);
    const mediaUrl = new URL(value, apiUrl);
    const mediaHost = mediaUrl.hostname.toLowerCase();
    const apiHost = apiUrl.hostname.toLowerCase();
    const localHost = LOCAL_STORAGE_HOSTS.has(mediaHost);
    const privateHost = isPrivateIpv4(mediaHost) && isPrivateIpv4(apiHost);

    if ((localHost || privateHost) && apiHost !== 'localhost' && apiHost !== '127.0.0.1') {
      mediaUrl.hostname = apiUrl.hostname;
    }

    return mediaUrl.toString();
  } catch {
    return value;
  }
}
