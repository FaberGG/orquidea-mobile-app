import { isNativeMapAvailable } from './map-availability';

describe('isNativeMapAvailable', () => {
  it('en Android sin API key no se puede montar el mapa', () => {
    expect(isNativeMapAvailable('android', undefined)).toBe(false);
    expect(isNativeMapAvailable('android', '')).toBe(false);
    expect(isNativeMapAvailable('android', '   ')).toBe(false);
  });

  it('en Android con API key sí', () => {
    expect(isNativeMapAvailable('android', 'AIza-demo')).toBe(true);
  });

  it('en iOS no depende de la key de Google', () => {
    expect(isNativeMapAvailable('ios', undefined)).toBe(true);
  });
});
