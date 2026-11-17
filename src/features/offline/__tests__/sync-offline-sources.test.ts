import { QueryClient } from '@tanstack/react-query';

import { downloadOfflineFiles, pruneOfflineFiles, type OfflineSource } from '@/lib/offline';

import { syncOfflineSources } from '../sync-offline-sources';

jest.mock('@/features/species', () => ({ speciesOfflineSource: {} }));
jest.mock('@/features/map', () => ({ stationsOfflineSource: {} }));
jest.mock('@/lib/offline', () => ({
  DEFAULT_OFFLINE_FOLDER: 'photos',
  downloadOfflineFiles: jest.fn(async () => ({ downloaded: 0, skipped: 0, failed: 0 })),
  pruneOfflineFiles: jest.fn(() => 0),
}));

const queryClient = new QueryClient();

function source(name: string, prefetch: OfflineSource['prefetch'], folder?: string): OfflineSource {
  return { name, queryKey: [name], prefetch, folder };
}

beforeEach(() => jest.clearAllMocks());

describe('syncOfflineSources (HU-21)', () => {
  it('une las fotos de las fuentes por carpeta, las descarga y poda las que sobran', async () => {
    const result = await syncOfflineSources(queryClient, {
      sources: [
        source('species', async () => ['a.jpg']),
        source('stations', async () => ['b.jpg']),
        source('map', async () => ['tile.png'], 'map-tiles'),
      ],
    });

    expect(result).toEqual({ synced: ['species', 'stations', 'map'], failed: [] });
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

    expect(result).toEqual({ synced: ['species'], failed: ['stations'] });
    expect(downloadOfflineFiles).toHaveBeenCalledWith(['a.jpg'], expect.anything());
    expect(pruneOfflineFiles).not.toHaveBeenCalled();
  });
});
