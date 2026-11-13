import { ApiError, type ApiErrorKind } from '@/lib/api';
import { getOfflineJson, removeLocalFile, storeLocalFile } from '@/lib/offline';

import { type SightingInput } from '../types';
import {
  enqueueSighting,
  getSightingQueueState,
  loadSightingQueue,
  removeQueuedSighting,
  resetSightingQueueForTests,
  retryQueuedSighting,
  SIGHTING_QUEUE_KEY,
  type QueuedSighting,
} from './sighting-queue';
import { syncSightingQueue } from './sync-sighting-queue';

let mockUuid = 0;
jest.mock('expo-crypto', () => ({ randomUUID: () => `uuid-${++mockUuid}` }));
jest.mock('@/lib/offline', () => {
  const actual = jest.requireActual('@/lib/offline');
  return {
    ...actual,
    storeLocalFile: jest.fn(
      (_uri: string, folder: string, name: string) => `file:///${folder}/${name}`,
    ),
    removeLocalFile: jest.fn(),
  };
});
jest.mock('../api', () => ({ createSighting: jest.fn() }));

const INPUT: SightingInput = {
  remarks: 'Garza blanca en el borde del agua',
  kingdom: 'animalia',
  vernacularName: 'Garza',
  location: { latitude: 2.46, longitude: -76.61 },
  photo: null,
};

const WITH_PHOTO: SightingInput = {
  ...INPUT,
  photo: {
    uri: 'file:///cache/picker/abc.jpg',
    fileName: 'abc.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1000,
  },
};

function httpError(status: number, serverMessage?: string) {
  return new ApiError({ status, kind: 'http', path: '/api/reportes-avistamiento', serverMessage });
}

function connectionError(kind: ApiErrorKind = 'network') {
  return new ApiError({ status: 0, kind, path: '/api/reportes-avistamiento' });
}

beforeEach(async () => {
  jest.clearAllMocks();
  mockUuid = 0;
  resetSightingQueueForTests();
  // El kv-store de prueba vive entre pruebas: se vacía guardando una cola vacía.
  await jest.requireActual('@/lib/offline').setOfflineJson(SIGHTING_QUEUE_KEY, []);
});

describe('cola de reportes sin conexión (HU-22 CA1)', () => {
  it('guarda el reporte como pendiente, con UUID, dueño y fecha, y lo persiste', async () => {
    const item = await enqueueSighting(INPUT, 'user-1');

    expect(item).toMatchObject({
      id: 'uuid-1',
      ownerId: 'user-1',
      status: 'pending',
      errorMessage: null,
      input: INPUT,
    });
    expect(Number.isNaN(Date.parse(item.createdAt))).toBe(false);
    expect(await getOfflineJson<QueuedSighting[]>(SIGHTING_QUEUE_KEY)).toEqual([item]);
  });

  it('copia la foto a la carpeta de la app y guarda la nueva URI', async () => {
    const item = await enqueueSighting(WITH_PHOTO, 'user-1');

    expect(storeLocalFile).toHaveBeenCalledWith(
      'file:///cache/picker/abc.jpg',
      'pending-sightings',
      'uuid-1.jpg',
    );
    expect(item.input.photo?.uri).toBe('file:///pending-sightings/uuid-1.jpg');
  });

  it('se recupera del dispositivo al volver a abrir la app', async () => {
    await enqueueSighting(INPUT, 'user-1');
    resetSightingQueueForTests();

    expect(await loadSightingQueue()).toHaveLength(1);
  });

  it('DESCARTAR lo quita de la cola y borra su foto', async () => {
    const item = await enqueueSighting(WITH_PHOTO, 'user-1');
    await removeQueuedSighting(item.id);

    expect(getSightingQueueState().items).toEqual([]);
    expect(removeLocalFile).toHaveBeenCalledWith('file:///pending-sightings/uuid-1.jpg');
  });
});

describe('sincronización (HU-22 CA2)', () => {
  it('envía en orden con el id del cliente y vacía la cola', async () => {
    await enqueueSighting(INPUT, 'user-1');
    await enqueueSighting({ ...INPUT, remarks: 'Colibrí' }, 'user-1');
    const send = jest.fn().mockResolvedValue({});

    const result = await syncSightingQueue('user-1', send);

    expect(result).toEqual({ sent: 2, failed: 0, stoppedBy: null });
    expect(send.mock.calls.map(([item]) => item.id)).toEqual(['uuid-1', 'uuid-2']);
    expect(getSightingQueueState().items).toEqual([]);
  });

  it('solo envía los reportes del usuario con sesión', async () => {
    await enqueueSighting(INPUT, 'user-1');
    await enqueueSighting(INPUT, 'user-2');
    const send = jest.fn().mockResolvedValue({});

    await syncSightingQueue('user-1', send);

    expect(send).toHaveBeenCalledTimes(1);
    expect(getSightingQueueState().items.map((item) => item.ownerId)).toEqual(['user-2']);
  });

  it.each<ApiErrorKind>(['network', 'timeout'])(
    'sin red (%s) se detiene y conserva el reporte para reintentar',
    async (kind) => {
      await enqueueSighting(INPUT, 'user-1');
      await enqueueSighting(INPUT, 'user-1');
      const send = jest.fn().mockRejectedValue(connectionError(kind));

      const result = await syncSightingQueue('user-1', send);

      expect(result).toEqual({ sent: 0, failed: 0, stoppedBy: 'network' });
      expect(send).toHaveBeenCalledTimes(1);
      expect(getSightingQueueState().items.map((item) => item.status)).toEqual([
        'pending',
        'pending',
      ]);
    },
  );

  it('un 4xx es definitivo: queda "failed" con el mensaje y sigue con el resto', async () => {
    await enqueueSighting(INPUT, 'user-1');
    await enqueueSighting(INPUT, 'user-1');
    const send = jest
      .fn()
      .mockRejectedValueOnce(httpError(400, 'El formato de la imagen no es válido.'))
      .mockResolvedValueOnce({});

    const result = await syncSightingQueue('user-1', send);

    expect(result).toEqual({ sent: 1, failed: 1, stoppedBy: null });
    expect(getSightingQueueState().items).toEqual([
      expect.objectContaining({
        id: 'uuid-1',
        status: 'failed',
        errorMessage: 'El formato de la imagen no es válido.',
      }),
    ]);
  });

  it('los "failed" no se reenvían solos; REINTENTAR los vuelve a dejar pendientes', async () => {
    await enqueueSighting(INPUT, 'user-1');
    await syncSightingQueue('user-1', jest.fn().mockRejectedValue(httpError(400)));
    const send = jest.fn().mockResolvedValue({});

    await syncSightingQueue('user-1', send);
    expect(send).not.toHaveBeenCalled();

    const before = getSightingQueueState().syncRequest;
    await retryQueuedSighting('uuid-1');
    expect(getSightingQueueState().items[0]?.status).toBe('pending');
    expect(getSightingQueueState().syncRequest).toBe(before + 1);
  });

  it('401: la sesión venció; este y los siguientes quedan esperando un nuevo inicio de sesión', async () => {
    await enqueueSighting(INPUT, 'user-1');
    await enqueueSighting(INPUT, 'user-1');
    const send = jest.fn().mockRejectedValue(httpError(401));

    const result = await syncSightingQueue('user-1', send);

    expect(result.stoppedBy).toBe('session');
    expect(send).toHaveBeenCalledTimes(1);
    expect(getSightingQueueState().items.map((item) => item.status)).toEqual([
      'needs-login',
      'needs-login',
    ]);
  });

  it('un 5xx se detiene y conserva el reporte pendiente', async () => {
    await enqueueSighting(INPUT, 'user-1');
    const result = await syncSightingQueue('user-1', jest.fn().mockRejectedValue(httpError(503)));

    expect(result.stoppedBy).toBe('server');
    expect(getSightingQueueState().items[0]?.status).toBe('pending');
  });

  it('no solapa dos sincronizaciones', async () => {
    await enqueueSighting(INPUT, 'user-1');
    const send = jest.fn().mockResolvedValue({});

    const [first, second] = await Promise.all([
      syncSightingQueue('user-1', send),
      syncSightingQueue('user-1', send),
    ]);

    expect(send).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });
});
