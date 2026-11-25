import { Platform } from 'react-native';

import { WETLAND_CENTER } from '../constants';
import type * as OfflineTiles from './offline-tiles';

// Sistema de archivos en memoria: ruta → contenido de origen (para saber de dónde se copió).
const mockDisk = new Map<string, string>();
const mockAsset = {
  hash: 'abc123' as string | null,
  localUri: 'file://cache/popayan-z14.pmtiles' as string | null,
  downloadAsync: jest.fn(async () => undefined),
};

jest.mock('expo-asset', () => ({ Asset: { fromModule: jest.fn(() => mockAsset) } }));

jest.mock('expo-file-system', () => {
  const join = (parts: unknown[]) =>
    parts
      .map((part) => (typeof part === 'string' ? part : (part as { uri: string }).uri))
      .join('/');

  class MockFile {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = join(parts);
    }
    get name() {
      return this.uri.split('/').pop() ?? '';
    }
    get exists() {
      return mockDisk.has(this.uri);
    }
    delete() {
      mockDisk.delete(this.uri);
    }
    copy = jest.fn(async (destination: MockFile) => {
      mockDisk.set(destination.uri, this.uri);
    });
    move = jest.fn(async (destination: MockFile) => {
      mockDisk.set(destination.uri, mockDisk.get(this.uri) ?? '');
      mockDisk.delete(this.uri);
      this.uri = destination.uri;
    });
  }

  class MockDirectory {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = join(parts);
    }
    create() {}
    list() {
      return [...mockDisk.keys()]
        .filter((path) => path.startsWith(`${this.uri}/`))
        .map((path) => new MockFile(path));
    }
  }

  return { File: MockFile, Directory: MockDirectory, Paths: { document: { uri: 'file://doc' } } };
});

const TARGET = 'file://doc/bundled-maps/popayan-z14-abc123.pmtiles';

/** Cada prueba carga el módulo de nuevo para no heredar la ruta ya resuelta en la sesión. */
function loadModule(): typeof OfflineTiles {
  let loaded: typeof OfflineTiles | undefined;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    loaded = require('./offline-tiles');
  });
  if (!loaded) throw new Error('No se cargó offline-tiles');
  return loaded;
}

beforeEach(() => {
  mockDisk.clear();
  mockAsset.hash = 'abc123';
  mockAsset.localUri = 'file://cache/popayan-z14.pmtiles';
  mockAsset.downloadAsync.mockClear();
  Platform.OS = 'android';
});

describe('getOfflineTilesUri (SCRUM-85)', () => {
  it('copia el PMTiles de la app a documentos con su versión en el nombre', async () => {
    const { getOfflineTilesUri } = loadModule();

    await expect(getOfflineTilesUri()).resolves.toBe(TARGET);
    expect(mockDisk.get(TARGET)).toBe('file://cache/popayan-z14.pmtiles');
    expect(mockDisk.has('file://doc/bundled-maps/popayan-z14.tmp')).toBe(false);
  });

  it('si la versión ya está copiada, no la vuelve a copiar', async () => {
    mockDisk.set(TARGET, 'copia anterior');
    const { getOfflineTilesUri } = loadModule();

    await expect(getOfflineTilesUri()).resolves.toBe(TARGET);
    expect(mockDisk.get(TARGET)).toBe('copia anterior');
  });

  it('con una versión nueva borra las copias anteriores', async () => {
    mockDisk.set('file://doc/bundled-maps/popayan-z14-viejo.pmtiles', 'vieja');
    const { getOfflineTilesUri } = loadModule();

    await getOfflineTilesUri();
    expect([...mockDisk.keys()]).toEqual([TARGET]);
  });

  it('se resuelve una sola vez por sesión', async () => {
    const { getOfflineTilesUri } = loadModule();

    await Promise.all([getOfflineTilesUri(), getOfflineTilesUri()]);
    await getOfflineTilesUri();
    expect(mockAsset.downloadAsync).toHaveBeenCalledTimes(1);
  });

  it('si falla, el siguiente intento vuelve a probar', async () => {
    mockAsset.localUri = null;
    const { getOfflineTilesUri } = loadModule();

    await expect(getOfflineTilesUri()).rejects.toThrow('No se encontró el mapa offline');
    mockAsset.localUri = 'file://cache/popayan-z14.pmtiles';
    await expect(getOfflineTilesUri()).resolves.toBe(TARGET);
  });

  it('en web no está disponible', async () => {
    Platform.OS = 'web';
    const { getOfflineTilesUri } = loadModule();

    await expect(getOfflineTilesUri()).rejects.toThrow('web');
  });
});

describe('toPmtilesUrl e isInsideOfflineArea (SCRUM-85)', () => {
  it('arma la URL pmtiles:// que entiende MapLibre', async () => {
    const { toPmtilesUrl } = loadModule();
    expect(toPmtilesUrl(TARGET)).toBe(`pmtiles://${TARGET}`);
  });

  it('el humedal está dentro del área offline y Bogotá no', async () => {
    const { isInsideOfflineArea } = loadModule();
    expect(isInsideOfflineArea(WETLAND_CENTER)).toBe(true);
    expect(isInsideOfflineArea({ latitude: 4.711, longitude: -74.0721 })).toBe(false);
  });
});
