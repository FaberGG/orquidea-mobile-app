import { onlineManager } from '@tanstack/react-query';
import { act, render } from '@testing-library/react-native';

import {
  resetConnectivity,
  resetOfflineSyncStatus,
  setNetworkStatus,
  updateOfflineSyncStatus,
} from '@/lib/offline';

import { ConnectivityNotice } from '../components/connectivity-notice';
import { OFFLINE_MESSAGES, OFFLINE_RECONNECT_SETTLE_MS } from '../constants';

const mockShow = jest.fn();
jest.mock('@/components/feedback/toast', () => ({ useToast: () => ({ show: mockShow }) }));
jest.mock('@/features/species', () => ({ speciesOfflineSource: {} }));
jest.mock('@/features/map', () => ({ stationsOfflineSource: {} }));

async function settle() {
  await act(async () => {
    jest.advanceTimersByTime(OFFLINE_RECONNECT_SETTLE_MS);
  });
}

async function change(fn: () => void) {
  await act(async () => fn());
}

beforeEach(() => {
  jest.useFakeTimers();
  mockShow.mockClear();
  onlineManager.setOnline(true);
  resetConnectivity();
  resetOfflineSyncStatus();
});

afterEach(() => {
  jest.useRealTimers();
  onlineManager.setOnline(true);
});

describe('ConnectivityNotice (HU-21)', () => {
  it('no avisa al abrir la app con conexión ni mientras el estado es desconocido', async () => {
    await render(<ConnectivityNotice />);
    await settle();
    await change(() => setNetworkStatus('online'));
    await settle();

    expect(mockShow).not.toHaveBeenCalled();
  });

  it('avisa al abrir la app sin conexión', async () => {
    await render(<ConnectivityNotice />);
    await change(() => setNetworkStatus('offline'));
    await settle();

    expect(mockShow).toHaveBeenCalledWith(OFFLINE_MESSAGES.offline, 'info');
  });

  it('avisa al perder la conexión y al recuperarla', async () => {
    await render(<ConnectivityNotice />);
    await change(() => setNetworkStatus('online'));
    await settle();

    await change(() => setNetworkStatus('offline'));
    await settle();
    await change(() => setNetworkStatus('online'));
    await settle();

    expect(mockShow.mock.calls).toEqual([
      [OFFLINE_MESSAGES.offline, 'info'],
      [OFFLINE_MESSAGES.reconnected, 'info'],
    ]);
  });

  it('una red que parpadea no genera avisos', async () => {
    await render(<ConnectivityNotice />);
    await change(() => setNetworkStatus('online'));
    await settle();

    for (let i = 0; i < 3; i++) {
      await change(() => setNetworkStatus('offline'));
      await change(() => setNetworkStatus('online'));
    }
    await settle();

    expect(mockShow).not.toHaveBeenCalled();
  });

  it('avisa al terminar una sincronización solo si guardó archivos nuevos', async () => {
    await render(<ConnectivityNotice />);

    await change(() => updateOfflineSyncStatus({ phase: 'syncing' }));
    await change(() => updateOfflineSyncStatus({ phase: 'done', downloaded: 0 }));
    expect(mockShow).not.toHaveBeenCalled();

    await change(() => updateOfflineSyncStatus({ phase: 'syncing' }));
    await change(() => updateOfflineSyncStatus({ phase: 'done', downloaded: 3 }));
    expect(mockShow).toHaveBeenCalledWith(OFFLINE_MESSAGES.updated, 'info');
  });
});
