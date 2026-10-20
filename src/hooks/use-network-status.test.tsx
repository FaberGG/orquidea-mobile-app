import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  addNetworkStateListener,
  getNetworkStateAsync,
  NetworkStateType,
  type NetworkState,
} from 'expo-network';

import { useNetworkStatus } from './use-network-status';

jest.mock('expo-network', () => ({
  addNetworkStateListener: jest.fn(),
  getNetworkStateAsync: jest.fn(),
  NetworkStateType: { NONE: 'NONE', UNKNOWN: 'UNKNOWN' },
}));

describe('useNetworkStatus', () => {
  let listener: ((state: NetworkState) => void) | undefined;
  let removeListener: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    listener = undefined;
    removeListener = jest.fn();
    jest.mocked(addNetworkStateListener).mockImplementation((callback) => {
      listener = callback;
      return { remove: removeListener } as never;
    });
    jest.mocked(getNetworkStateAsync).mockResolvedValue({ isConnected: true });
  });

  it('comienza como desconocido y actualiza el estado con la lectura inicial', async () => {
    let finishRead!: (state: NetworkState) => void;
    jest.mocked(getNetworkStateAsync).mockReturnValueOnce(
      new Promise((resolve) => {
        finishRead = resolve;
      }),
    );
    const { result } = await renderHook(() => useNetworkStatus());

    expect(result.current.status).toBe('unknown');
    await act(async () => finishRead({ isConnected: true }));
    await waitFor(() => expect(result.current.status).toBe('online'));
  });

  it('prioriza un evento de red reciente sobre la lectura inicial que termina tarde', async () => {
    let finishRead!: (state: NetworkState) => void;
    jest.mocked(getNetworkStateAsync).mockReturnValueOnce(
      new Promise((resolve) => {
        finishRead = resolve;
      }),
    );
    const { result } = await renderHook(() => useNetworkStatus());

    await act(async () => {
      listener?.({ type: NetworkStateType.NONE, isConnected: false });
      finishRead({ isConnected: true });
      await Promise.resolve();
    });

    expect(result.current.status).toBe('offline');
  });

  it('refresh devuelve y publica una lectura actualizada', async () => {
    const { result } = await renderHook(() => useNetworkStatus());
    await waitFor(() => expect(result.current.status).toBe('online'));
    jest
      .mocked(getNetworkStateAsync)
      .mockResolvedValueOnce({ type: NetworkStateType.NONE, isConnected: false });

    await act(async () => {
      await expect(result.current.refresh()).resolves.toBe('offline');
    });

    expect(result.current.status).toBe('offline');
  });

  it('conserva el estado desconocido si el módulo no puede informar', async () => {
    jest.mocked(getNetworkStateAsync).mockRejectedValue(new Error('unavailable'));
    const { result } = await renderHook(() => useNetworkStatus());

    await waitFor(() => expect(getNetworkStateAsync).toHaveBeenCalled());
    expect(result.current.status).toBe('unknown');
    await expect(result.current.refresh()).resolves.toBe('unknown');
  });

  it('no confunde un tipo de red desconocido con una desconexión confirmada', async () => {
    jest
      .mocked(getNetworkStateAsync)
      .mockResolvedValueOnce({ type: NetworkStateType.UNKNOWN, isConnected: false });
    const { result } = await renderHook(() => useNetworkStatus());

    await waitFor(() => expect(getNetworkStateAsync).toHaveBeenCalled());
    expect(result.current.status).toBe('unknown');
  });

  it('retira la suscripción al desmontar', async () => {
    const { unmount } = await renderHook(() => useNetworkStatus());

    expect(addNetworkStateListener).toHaveBeenCalledTimes(1);
    await act(async () => unmount());

    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
