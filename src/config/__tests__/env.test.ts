import { parseEnv } from '../env';

describe('parseEnv', () => {
  it('acepta una URL válida y usa "development" como entorno por defecto', () => {
    expect(parseEnv({ EXPO_PUBLIC_API_URL: 'http://localhost:8080' })).toEqual({
      apiUrl: 'http://localhost:8080',
      appEnv: 'development',
    });
  });

  it('falla con un mensaje claro si falta la URL de la API', () => {
    expect(() => parseEnv({})).toThrow(/EXPO_PUBLIC_API_URL/);
  });

  it('rechaza una URL con barra final', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_API_URL: 'http://localhost:8080/' })).toThrow(
      /no debe terminar en "\/"/,
    );
  });

  it('rechaza un entorno desconocido', () => {
    expect(() =>
      parseEnv({ EXPO_PUBLIC_API_URL: 'http://localhost:8080', EXPO_PUBLIC_APP_ENV: 'qa' }),
    ).toThrow(/EXPO_PUBLIC_APP_ENV/);
  });
});
