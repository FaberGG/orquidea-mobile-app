import { File } from 'expo-file-system';

import {
  clearOfflineFiles,
  downloadOfflineFiles,
  getOfflineFileUri,
  offlineFileName,
  pruneOfflineFiles,
} from '../offline-files';

// Sistema de archivos en memoria: rutas → existe.
const mockDisk = new Set<string>();

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
    static downloadFileAsync = jest.fn(async (url: string, destination: MockFile) => {
      if (url.includes('falla')) throw new Error('404');
      mockDisk.add(destination.uri);
      return destination;
    });
  }

  class MockDirectory {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = join(parts);
    }
    get exists() {
      return [...mockDisk].some((path) => path.startsWith(`${this.uri}/`));
    }
    create() {}
    list() {
      return [...mockDisk]
        .filter((path) => path.startsWith(`${this.uri}/`))
        .map((path) => new MockFile(path));
    }
    delete() {
      for (const path of [...mockDisk]) if (path.startsWith(`${this.uri}/`)) mockDisk.delete(path);
    }
  }

  return { File: MockFile, Directory: MockDirectory, Paths: { document: { uri: 'file://doc' } } };
});

const FOTO_A = 'https://r2.example/fichas/a.jpg';
const FOTO_B = 'https://r2.example/fichas/b.png?v=2';

beforeEach(() => {
  mockDisk.clear();
  jest.clearAllMocks();
});

describe('archivos offline (fotos)', () => {
  it('nombra cada URL de forma estable y conserva la extensión', () => {
    expect(offlineFileName(FOTO_A)).toBe(offlineFileName(FOTO_A));
    expect(offlineFileName(FOTO_A)).not.toBe(offlineFileName(FOTO_B));
    expect(offlineFileName(FOTO_A)).toMatch(/\.jpg$/);
    expect(offlineFileName(FOTO_B)).toMatch(/\.png$/);
    expect(offlineFileName('https://r2.example/sin-extension')).toMatch(/\.bin$/);
  });

  it('descarga solo lo que falta, cuenta fallos y devuelve la URI local', async () => {
    expect(getOfflineFileUri(FOTO_A)).toBeNull();

    const first = await downloadOfflineFiles([FOTO_A, FOTO_A, 'https://r2.example/falla.jpg']);
    expect(first).toEqual({ downloaded: 1, skipped: 0, failed: 1 });
    expect(getOfflineFileUri(FOTO_A)).toMatch(/offline-files\/photos\/.+\.jpg$/);

    const second = await downloadOfflineFiles([FOTO_A, FOTO_B]);
    expect(second).toEqual({ downloaded: 1, skipped: 1, failed: 0 });
    expect(File.downloadFileAsync).toHaveBeenCalledTimes(3);
  });

  it('poda los archivos que ya no se usan y separa carpetas', async () => {
    await downloadOfflineFiles([FOTO_A, FOTO_B]);
    await downloadOfflineFiles([FOTO_A], { folder: 'map-tiles' });

    expect(pruneOfflineFiles([FOTO_A])).toBe(1);
    expect(getOfflineFileUri(FOTO_A)).not.toBeNull();
    expect(getOfflineFileUri(FOTO_B)).toBeNull();
    expect(getOfflineFileUri(FOTO_A, 'map-tiles')).not.toBeNull();

    clearOfflineFiles('photos');
    expect(getOfflineFileUri(FOTO_A)).toBeNull();
    expect(getOfflineFileUri(FOTO_A, 'map-tiles')).not.toBeNull();
  });
});
