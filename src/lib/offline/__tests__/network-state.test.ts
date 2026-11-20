import { NetworkStateType } from 'expo-network';

import { toNetworkStatus } from '../network-state';

describe('toNetworkStatus (ADR-0015)', () => {
  it('solo considera desconexión confirmada isConnected=false con tipo NONE', () => {
    expect(toNetworkStatus({ isConnected: false, type: NetworkStateType.NONE })).toBe('offline');
    expect(toNetworkStatus({ isConnected: true, type: NetworkStateType.WIFI })).toBe('online');
    expect(toNetworkStatus({ isConnected: false, type: NetworkStateType.UNKNOWN })).toBe('unknown');
    expect(toNetworkStatus({})).toBe('unknown');
  });
});
