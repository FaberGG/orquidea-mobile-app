import * as FileSystem from 'expo-file-system/legacy';

import { type TrailMap } from '../types';
import { deleteOfflineTrail, downloadTrail, readOfflineTrails } from './offline-trails';

jest.mock('expo-file-system/legacy', () => {
  const files: Record<string, string> = {};
  return {
    documentDirectory: 'file:///documents/',
    makeDirectoryAsync: jest.fn(async () => {}),
    writeAsStringAsync: jest.fn(async (uri: string, text: string) => {
      files[uri] = text;
    }),
    getInfoAsync: jest.fn(async () => ({ exists: true })),
    readDirectoryAsync: jest.fn(async () => Object.keys(files).map((uri) => uri.split('/').pop())),
    readAsStringAsync: jest.fn(async (uri: string) => files[uri]),
    deleteAsync: jest.fn(async (uri: string) => {
      delete files[uri];
    }),
  };
});

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: 'jpeg' },
}));

const id = 'a31539c4-77d4-45be-9b60-c9f26c44fc81';
const map: TrailMap = {
  version: 'v1',
  bounds: null,
  segments: [
    {
      id,
      name: 'Sendero',
      order: 1,
      coordinates: [
        { latitude: 2.45, longitude: -76.59 },
        { latitude: 2.46, longitude: -76.59 },
      ],
    },
  ],
  stations: [
    {
      id: '1',
      name: 'Cerca',
      description: 'Descripción',
      photoUrl: 'http://localhost/image',
      coordinates: { latitude: 2.455, longitude: -76.59 },
      species: [],
    },
    {
      id: '2',
      name: 'Lejos',
      description: null,
      photoUrl: null,
      coordinates: { latitude: 2.5, longitude: -76.6 },
      species: [],
    },
  ],
};

it('descarga un tramo y recupera solo las estaciones cercanas, incluso sin pedir la API', async () => {
  await downloadTrail(map, id);
  const packs = await readOfflineTrails();
  expect(packs).toHaveLength(1);
  expect(packs[0].segment.coordinates).toEqual(map.segments[0].coordinates);
  expect(packs[0].stations.map((station) => station.name)).toEqual(['Cerca']);
  expect(JSON.stringify(packs[0])).not.toContain('localhost');
  await deleteOfflineTrail(id);
  expect(await readOfflineTrails()).toEqual([]);
});

it('rechaza tramos inexistentes sin escribir un paquete', async () => {
  jest.mocked(FileSystem.writeAsStringAsync).mockClear();
  await expect(downloadTrail(map, 'missing')).rejects.toThrow();
  expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled();
});

it('recupera el recorrido de paquetes anteriores ignorando la referencia satelital retirada', async () => {
  const pack = await downloadTrail(map, id);
  await FileSystem.writeAsStringAsync(
    `file:///documents/senderos-offline/${id}.json`,
    JSON.stringify({ ...pack, satellitePack: 'previous-pack' }),
  );

  expect(await readOfflineTrails()).toEqual([pack]);
  await deleteOfflineTrail(id);
});
