import { onlineManager } from '@tanstack/react-query';

import {
  getConnectivity,
  isBackendUnreachable,
  reportBackendReachable,
  reportBackendUnreachable,
  resetConnectivity,
  setNetworkStatus,
  subscribeConnectivity,
} from '../connectivity';

beforeEach(() => {
  onlineManager.setOnline(true);
  resetConnectivity();
});

afterEach(() => onlineManager.setOnline(true));

describe('conectividad efectiva (HU-21)', () => {
  it('antes de la primera lectura es desconocida (no bloquea ni avisa)', () => {
    expect(getConnectivity()).toBe('unknown');
  });

  it('con red y sin noticias del backend está en línea', () => {
    setNetworkStatus('online');
    expect(getConnectivity()).toBe('online');
  });

  it('sin red confirmada está sin conexión, también vía onlineManager', () => {
    setNetworkStatus('offline');
    expect(getConnectivity()).toBe('offline');

    resetConnectivity();
    onlineManager.setOnline(false);
    expect(getConnectivity()).toBe('offline');
  });

  it('con red, un fallo por red o tiempo agotado cuenta como sin conexión', () => {
    setNetworkStatus('online');
    reportBackendUnreachable();

    expect(getConnectivity()).toBe('offline');
    expect(isBackendUnreachable()).toBe(true);
  });

  it('una respuesta del backend lo restablece', () => {
    setNetworkStatus('online');
    reportBackendUnreachable();
    reportBackendReachable();

    expect(getConnectivity()).toBe('online');
  });

  it('con estado de red desconocido, una respuesta del backend basta para estar en línea', () => {
    reportBackendReachable();
    expect(getConnectivity()).toBe('online');
  });

  it('un cambio de red vuelve a dejar en duda al backend', () => {
    setNetworkStatus('online');
    reportBackendUnreachable();
    setNetworkStatus('offline');
    setNetworkStatus('online');

    expect(getConnectivity()).toBe('online');
  });

  it('avisa a los suscriptores al cambiar, incluido el onlineManager', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeConnectivity(listener);

    setNetworkStatus('online');
    onlineManager.setOnline(false);
    unsubscribe();
    reportBackendUnreachable();

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
