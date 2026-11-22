import { onlineManager, QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api';
import {
  downloadOfflineFiles,
  getConnectivity,
  getOfflineFileUri,
  getOfflineSyncStatus,
  pruneOfflineFiles,
  resetConnectivity,
  resetOfflineSyncStatus,
  setNetworkStatus,
  type OfflineSource,
} from '@/lib/offline';

import { syncOfflineSources } from '../sync-offline-sources';

jest.mock('@/features/species', () => ({ speciesOfflineSource: {} }));
jest.mock('@/features/map', () => ({ stationsOfflineSource: {} }));
jest.mock('@/lib/offline', () => ({
  ...jest.requireActual('@/lib/offline'),
  downloadOfflineFiles: jest.fn(async () => ({ downloaded: 0, skipped: 0, failed: 0 })),
  pruneOfflineFiles: jest.fn(() => 0),
  getOfflineFileUri: jest.fn(() => null),
}));

const queryClient = new QueryClient();

function source(name: string, prefetch: OfflineSource['prefetch'], folder?: string): OfflineSource {
  return { name, queryKey: [name], prefetch, folder };
}

beforeEach(() => {
  jest.clearAllMocks();
  resetOfflineSyncStatus();
  resetConnectivity();
  onlineManager.setOnline(true);
});

describe('syncOfflineSources (HU-21)', () => {
  it('une las fotos de las fuentes por carpeta, las descarga y poda las que sobran', async () => {
    const result = await syncOfflineSources(queryClient, {
      sources: [
        source('species', async () => ['a.jpg']),
        source('stations', async () => ['b.jpg']),
        source('map', async () => ['tile.png'], 'map-tiles'),
      ],
    });

    expect(result).toEqual({ synced: ['species', 'stations', 'map'], failed: [], downloaded: 0 });
    expect(downloadOfflineFiles).toHaveBeenCalledWith(
      ['a.jpg', 'b.jpg'],
      expect.objectContaining({ folder: 'photos' }),
    );
    expect(downloadOfflineFiles).toHaveBeenCalledWith(
      ['tile.png'],
      expect.objectContaining({ folder: 'map-tiles' }),
    );
    expect(pruneOfflineFiles).toHaveBeenCalledWith(['a.jpg', 'b.jpg'], 'photos');
  });

  it('no poda una carpeta si alguna de sus fuentes falló', async () => {
    const result = await syncOfflineSources(queryClient, {
      sources: [
        source('species', async () => ['a.jpg']),
        source('stations', async () => {
          throw new Error('sin red');
        }),
      ],
    });

    expect(result).toEqual({ synced: ['species'], failed: ['stations'], downloaded: 0 });
    expect(downloadOfflineFiles).toHaveBeenCalledWith(['a.jpg'], expect.anything());
    expect(pruneOfflineFiles).not.toHaveBeenCalled();
  });

  it('publica el progreso contando solo las fotos que faltan y termina en `done`', async () => {
    jest
      .mocked(getOfflineFileUri)
      .mockImplementation((url) => (url === 'ya.jpg' ? 'file:///ya.jpg' : null));
    const seen: { done: number; total: number }[] = [];
    jest.mocked(downloadOfflineFiles).mockImplementation(async (_urls, options) => {
      seen.push(getOfflineSyncStatus().files);
      options?.onProgress?.({ downloaded: 1, skipped: 1, failed: 0 });
      seen.push(getOfflineSyncStatus().files);
      options?.onProgress?.({ downloaded: 2, skipped: 1, failed: 0 });
      seen.push(getOfflineSyncStatus().files);
      return { downloaded: 2, skipped: 1, failed: 0 };
    });
    const before = getOfflineSyncStatus().filesVersion;

    const result = await syncOfflineSources(queryClient, {
      sources: [source('species', async () => ['ya.jpg', 'a.jpg', 'b.jpg'])],
    });

    expect(seen).toEqual([
      { done: 0, total: 2 },
      { done: 1, total: 2 },
      { done: 2, total: 2 },
    ]);
    expect(result.downloaded).toBe(2);
    const status = getOfflineSyncStatus();
    expect(status.phase).toBe('done');
    expect(status.downloaded).toBe(2);
    expect(status.lastSuccessAt).toEqual(expect.any(Number));
    expect(status.filesVersion).toBeGreaterThan(before);
  });

  it('con alguna fuente fallida termina en `failed` y no actualiza la última sincronización', async () => {
    await syncOfflineSources(queryClient, {
      sources: [
        source('species', async () => {
          throw new Error('500');
        }),
      ],
    });

    expect(getOfflineSyncStatus().phase).toBe('failed');
    expect(getOfflineSyncStatus().lastSuccessAt).toBeNull();
  });

  it('un fallo por red o tiempo agotado marca el backend como inalcanzable aunque haya red', async () => {
    setNetworkStatus('online');
    expect(getConnectivity()).toBe('online');

    await syncOfflineSources(queryClient, {
      sources: [
        source('species', async () => {
          throw new ApiError({ status: 0, kind: 'timeout', path: '/sincronizacion' });
        }),
      ],
    });

    expect(getConnectivity()).toBe('offline');
  });

  it('un error HTTP no cuenta como falta de conexión', async () => {
    setNetworkStatus('online');

    await syncOfflineSources(queryClient, {
      sources: [
        source('species', async () => {
          throw new ApiError({ status: 500, kind: 'http', path: '/sincronizacion' });
        }),
      ],
    });

    expect(getConnectivity()).toBe('online');
  });

  it('cancelada no se marca como fallo ni como éxito', async () => {
    const controller = new AbortController();
    controller.abort();

    await syncOfflineSources(queryClient, {
      sources: [source('species', async () => ['a.jpg'])],
      signal: controller.signal,
    });

    expect(getOfflineSyncStatus().phase).toBe('idle');
    expect(getOfflineSyncStatus().lastSuccessAt).toBeNull();
    expect(downloadOfflineFiles).not.toHaveBeenCalled();
  });
});
