import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useEffect as mockUseEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineDownloadsScreen } from './offline-downloads-screen';
import { getTrailMap } from '../api/map.api';
import { downloadTrail, readOfflineTrails } from '../utils/offline-trails';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
}));
jest.mock('../api/map.api', () => ({ getTrailMap: jest.fn() }));
jest.mock('../utils/offline-trails', () => ({
  downloadTrail: jest.fn(),
  readOfflineTrails: jest.fn(),
  deleteOfflineTrail: jest.fn(),
}));

const id = 'a31539c4-77d4-45be-9b60-c9f26c44fc81';
const segment = {
  id,
  name: 'Sendero',
  order: 1,
  coordinates: [
    { latitude: 2.45, longitude: -76.59 },
    { latitude: 2.46, longitude: -76.59 },
  ],
};
const map = { version: 'v1', bounds: null, segments: [segment], stations: [] };
const savedPack = {
  format: 1 as const,
  savedAt: '2026-11-01T12:00:00Z',
  mapVersion: 'v1',
  segment,
  stations: [],
};
const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getTrailMap).mockResolvedValue(map);
  jest.mocked(readOfflineTrails).mockResolvedValue([]);
  jest.mocked(downloadTrail).mockResolvedValue(savedPack);
});

it('guarda el recorrido y permite abrirlo desde las descargas', async () => {
  jest.mocked(readOfflineTrails).mockResolvedValueOnce([]).mockResolvedValue([savedPack]);
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <OfflineDownloadsScreen />
    </SafeAreaProvider>,
  );
  await fireEvent.press(await screen.findByText('DESCARGAR RUTA Y FOTOS'));
  await waitFor(() => expect(downloadTrail).toHaveBeenCalledWith(map, id));
  expect(await screen.findByText(/Recorrido y estaciones guardados/)).toBeTruthy();
  expect(await screen.findByText('VER SIN CONEXIÓN')).toBeTruthy();
});

it('informa un error de almacenamiento sin anunciar una descarga completada', async () => {
  jest.mocked(downloadTrail).mockRejectedValue(new Error('Sin espacio'));
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <OfflineDownloadsScreen />
    </SafeAreaProvider>,
  );
  await fireEvent.press(await screen.findByText('DESCARGAR RUTA Y FOTOS'));
  expect(await screen.findByText(/No pudimos guardar el recorrido/)).toBeTruthy();
  expect(screen.queryByText(/Recorrido y estaciones guardados/)).toBeNull();
  expect(screen.queryByText('VER SIN CONEXIÓN')).toBeNull();
});

it('abre un recorrido ya descargado aunque el servidor no esté disponible', async () => {
  jest.mocked(readOfflineTrails).mockResolvedValue([savedPack]);
  jest.mocked(getTrailMap).mockRejectedValue(new Error('Sin conexión'));
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <OfflineDownloadsScreen />
    </SafeAreaProvider>,
  );
  expect(await screen.findByText(/Sin conexión al servidor/)).toBeTruthy();
  await fireEvent.press(await screen.findByText('VER SIN CONEXIÓN'));
  expect(await screen.findByLabelText('Esquema del sendero y sus estaciones')).toBeTruthy();
  expect(screen.getByText('MI UBICACIÓN')).toBeTruthy();
  expect(downloadTrail).not.toHaveBeenCalled();
});
