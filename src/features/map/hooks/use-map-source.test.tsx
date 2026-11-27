import { act, renderHook } from '@testing-library/react-native';

import { useNetworkStatus } from '@/hooks/use-network-status';

import {
  MAP_SOURCE_MESSAGES,
  MAP_SOURCE_SETTLE_MS,
  MAP_STYLE_URL,
  ONLINE_MAP_TIMEOUT_MS,
} from '../constants';
import { useMapSource } from './use-map-source';

const mockShow = jest.fn();
jest.mock('@/components/feedback/toast', () => ({ useToast: () => ({ show: mockShow }) }));
jest.mock('@/hooks/use-network-status', () => ({ useNetworkStatus: jest.fn() }));
jest.mock('./use-offline-tiles', () => ({
  useOfflineTiles: () => ({ status: 'ready', url: 'pmtiles://file://doc/popayan.pmtiles' }),
}));

let network: 'online' | 'offline' | 'unknown' = 'online';

beforeEach(() => {
  jest.useFakeTimers();
  mockShow.mockClear();
  network = 'online';
  jest.mocked(useNetworkStatus).mockImplementation(() => ({ status: network, refresh: jest.fn() }));
});

afterEach(() => {
  jest.useRealTimers();
});

async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

function offlineUrl(style: unknown): string | undefined {
  return typeof style === 'object' && style !== null
    ? (style as { sources: { openmaptiles: { url: string } } }).sources.openmaptiles.url
    : undefined;
}

describe('useMapSource (SCRUM-84)', () => {
  it('con conexión usa OpenFreeMap y no avisa al abrir', async () => {
    const { result } = await renderHook(() => useMapSource());

    expect(result.current.mode).toBe('online');
    expect(result.current.mapStyle).toBe(MAP_STYLE_URL);
    await act(async () => result.current.onStyleLoaded());
    expect(mockShow).not.toHaveBeenCalled();
  });

  it('sin conexión usa el PMTiles y avisa "Usar mapa offline" una sola vez', async () => {
    network = 'offline';
    const { result, rerender } = await renderHook(() => useMapSource());

    expect(result.current.mode).toBe('offline');
    expect(offlineUrl(result.current.mapStyle)).toBe('pmtiles://file://doc/popayan.pmtiles');
    await rerender({});
    expect(mockShow).toHaveBeenCalledTimes(1);
    expect(mockShow).toHaveBeenCalledWith(MAP_SOURCE_MESSAGES.offline, 'info');
  });

  it('al perder la red espera a que se asiente antes de cambiar', async () => {
    const { result, rerender } = await renderHook(() => useMapSource());
    await act(async () => result.current.onStyleLoaded());

    network = 'offline';
    await rerender({});
    await advance(MAP_SOURCE_SETTLE_MS - 1);
    expect(result.current.mode).toBe('online');

    await advance(1);
    expect(result.current.mode).toBe('offline');
    expect(mockShow).toHaveBeenCalledWith(MAP_SOURCE_MESSAGES.offline, 'info');
  });

  it('una red que parpadea no cambia el mapa', async () => {
    const { result, rerender } = await renderHook(() => useMapSource());
    await act(async () => result.current.onStyleLoaded());

    network = 'offline';
    await rerender({});
    await advance(MAP_SOURCE_SETTLE_MS / 2);
    network = 'online';
    await rerender({});
    await advance(MAP_SOURCE_SETTLE_MS * 2);

    expect(result.current.mode).toBe('online');
    expect(mockShow).not.toHaveBeenCalled();
  });

  it('si OpenFreeMap falla con conexión, pasa al mapa offline', async () => {
    const { result } = await renderHook(() => useMapSource());

    await act(async () => result.current.onLoadFailed());
    expect(result.current.mode).toBe('offline');
    expect(mockShow).toHaveBeenCalledWith(MAP_SOURCE_MESSAGES.offline, 'info');
  });

  it('si OpenFreeMap no carga a tiempo, pasa al mapa offline', async () => {
    const { result } = await renderHook(() => useMapSource());

    await advance(ONLINE_MAP_TIMEOUT_MS);
    expect(result.current.mode).toBe('offline');
  });

  it('al volver la conexión reintenta OpenFreeMap y avisa cuando carga', async () => {
    network = 'offline';
    const { result, rerender } = await renderHook(() => useMapSource());
    mockShow.mockClear();

    network = 'online';
    await rerender({});
    await advance(MAP_SOURCE_SETTLE_MS);
    expect(result.current.mode).toBe('online');
    expect(result.current.mapStyle).toBe(MAP_STYLE_URL);
    expect(mockShow).not.toHaveBeenCalled();

    await act(async () => result.current.onStyleLoaded());
    expect(mockShow).toHaveBeenCalledTimes(1);
    expect(mockShow).toHaveBeenCalledWith(MAP_SOURCE_MESSAGES.online, 'info');
  });
});
