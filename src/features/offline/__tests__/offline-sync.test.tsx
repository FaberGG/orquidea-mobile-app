import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { requestOfflineSync, resetOfflineSyncStatus, updateOfflineSyncStatus } from '@/lib/offline';

import { OfflineSync } from '../components/offline-sync';
import { OFFLINE_RECONNECT_SETTLE_MS, OFFLINE_RESYNC_INTERVAL_MS } from '../constants';
import { syncOfflineSources } from '../sync-offline-sources';

jest.mock('@/features/species', () => ({ speciesOfflineSource: {} }));
jest.mock('@/features/map', () => ({ stationsOfflineSource: {} }));
jest.mock('../sync-offline-sources', () => ({ syncOfflineSources: jest.fn() }));

let mockStatus: 'online' | 'offline' | 'unknown' = 'online';
const mockRefresh = jest.fn(async () => mockStatus);
jest.mock('@/hooks/use-network-status', () => ({
  useNetworkStatus: () => ({ status: mockStatus, refresh: mockRefresh }),
}));

let appStateListener: ((state: AppStateStatus) => void) | undefined;
let signals: AbortSignal[];
let finishSync: (() => void)[];

const queryClient = new QueryClient();

function Tree() {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineSync />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  resetOfflineSyncStatus();
  mockStatus = 'online';
  signals = [];
  finishSync = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    appStateListener = listener as (state: AppStateStatus) => void;
    return { remove: jest.fn() } as never;
  });
  jest.mocked(syncOfflineSources).mockImplementation(
    (_client, options) =>
      new Promise((resolve) => {
        if (options?.signal) signals.push(options.signal);
        finishSync.push(() => resolve({ synced: [], failed: [], downloaded: 0 }));
      }),
  );
});

afterEach(() => {
  jest.useRealTimers();
});

async function setStatus(view: Awaited<ReturnType<typeof render>>, status: typeof mockStatus) {
  mockStatus = status;
  await view.rerender(<Tree />);
}

async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

async function finishCurrent() {
  await act(async () => {
    finishSync.shift()?.();
  });
}

describe('OfflineSync (HU-21)', () => {
  it('sincroniza una vez al abrir la app', async () => {
    await render(<Tree />);
    expect(syncOfflineSources).toHaveBeenCalledTimes(1);
  });

  it('al perder la red cancela la sincronización en curso', async () => {
    const view = await render(<Tree />);
    await setStatus(view, 'offline');

    expect(signals[0]?.aborted).toBe(true);
  });

  it('al reconectar espera a que la red se estabilice y sincroniza una sola vez aunque parpadee', async () => {
    const view = await render(<Tree />);
    await finishCurrent();

    for (let i = 0; i < 3; i++) {
      await setStatus(view, 'offline');
      await setStatus(view, 'online');
      await advance(OFFLINE_RECONNECT_SETTLE_MS / 2);
    }
    expect(syncOfflineSources).toHaveBeenCalledTimes(1);

    await advance(OFFLINE_RECONNECT_SETTLE_MS);
    expect(syncOfflineSources).toHaveBeenCalledTimes(2);
  });

  it('no solapa corridas: un pedido durante una corrida se repite al terminar', async () => {
    await render(<Tree />);
    await act(async () => requestOfflineSync());
    expect(syncOfflineSources).toHaveBeenCalledTimes(1);

    await finishCurrent();
    expect(syncOfflineSources).toHaveBeenCalledTimes(2);
  });

  it('al volver a primer plano relee la red y sincroniza si la copia es vieja', async () => {
    await render(<Tree />);
    await finishCurrent();
    updateOfflineSyncStatus({ lastSuccessAt: Date.now() - OFFLINE_RESYNC_INTERVAL_MS - 1 });

    await act(async () => appStateListener?.('active'));
    await advance(OFFLINE_RECONNECT_SETTLE_MS);

    expect(mockRefresh).toHaveBeenCalled();
    expect(syncOfflineSources).toHaveBeenCalledTimes(2);
  });

  it('al volver a primer plano con una copia reciente no sincroniza', async () => {
    await render(<Tree />);
    await finishCurrent();
    updateOfflineSyncStatus({ lastSuccessAt: Date.now() });

    await act(async () => appStateListener?.('active'));
    await advance(OFFLINE_RECONNECT_SETTLE_MS);

    expect(syncOfflineSources).toHaveBeenCalledTimes(1);
  });

  it('sin red no sincroniza al abrir', async () => {
    mockStatus = 'offline';
    await render(<Tree />);
    expect(syncOfflineSources).not.toHaveBeenCalled();
  });
});
