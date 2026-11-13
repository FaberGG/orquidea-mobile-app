import { type QueryClient, type QueryKey } from '@tanstack/react-query';

/**
 * Datos de una feature que deben quedar disponibles sin conexión (HU-21). Cada feature exporta su fuente desde
 * su `index.ts` y `features/offline` las registra y sincroniza. Guía: docs/architecture/OFFLINE.md.
 */
export type OfflineSource = {
  /** Nombre corto para depurar (p. ej. `'species'`). */
  name: string;
  /** Prefijo de las claves de caché que se guardan en el dispositivo (p. ej. `speciesKeys.all`). */
  queryKey: QueryKey;
  /**
   * Pide a la API los datos (con `queryClient.fetchQuery` / `setQueryData` bajo `queryKey`) y devuelve las
   * URLs de los archivos (fotos) que deben descargarse. Se llama con conexión al abrir la app y al reconectar.
   */
  prefetch: (queryClient: QueryClient) => Promise<string[]>;
  /** Carpeta de `downloadOfflineFiles` para sus archivos. Por defecto `'photos'`. */
  folder?: string;
};
