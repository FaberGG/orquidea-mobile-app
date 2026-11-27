import { onlineManager } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useStationsOfflineCount } from '@/features/map';
import { useSpeciesOfflineSummary } from '@/features/species';
import {
  requestOfflineSync,
  resetConnectivity,
  resetOfflineSyncStatus,
  setNetworkStatus,
  updateOfflineSyncStatus,
} from '@/lib/offline';

import { OfflineContentScreen } from '../components/offline-content-screen';
import { OFFLINE_CONTENT_LABELS as LABELS } from '../constants';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), navigate: jest.fn() } }));
jest.mock('@/features/species', () => ({
  speciesOfflineSource: {},
  useSpeciesOfflineSummary: jest.fn(),
}));
jest.mock('@/features/map', () => ({
  stationsOfflineSource: {},
  useStationsOfflineCount: jest.fn(),
}));
jest.mock('@/lib/offline', () => ({
  ...jest.requireActual('@/lib/offline'),
  requestOfflineSync: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function Providers({ children }: { children: ReactNode }) {
  return <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>{children}</SafeAreaProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  onlineManager.setOnline(true);
  resetConnectivity();
  resetOfflineSyncStatus();
  setNetworkStatus('online');
  jest.mocked(useSpeciesOfflineSummary).mockReturnValue({ total: 12, complete: 9 });
  jest.mocked(useStationsOfflineCount).mockReturnValue(4);
});

afterEach(() => onlineManager.setOnline(true));

describe('Contenido sin conexión (HU-21)', () => {
  it('resume las fichas y estaciones guardadas y el mapa incluido', async () => {
    updateOfflineSyncStatus({ phase: 'done', lastSuccessAt: Date.UTC(2026, 10, 22, 15, 0) });
    await render(<OfflineContentScreen />, { wrapper: Providers });

    expect(screen.getByText(LABELS.speciesSummary(9, 12))).toBeTruthy();
    expect(screen.getByText(LABELS.stationsSummary(4))).toBeTruthy();
    expect(screen.getByText(LABELS.mapIncluded)).toBeTruthy();
    expect(screen.getByText(/^Actualizado el /)).toBeTruthy();
  });

  it('"Actualizar ahora" pide una sincronización', async () => {
    await render(<OfflineContentScreen />, { wrapper: Providers });

    fireEvent.press(screen.getByRole('button', { name: LABELS.updateNow }));

    expect(requestOfflineSync).toHaveBeenCalledTimes(1);
  });

  it('sin conexión desactiva "Actualizar ahora" y lo indica', async () => {
    onlineManager.setOnline(false);
    await render(<OfflineContentScreen />, { wrapper: Providers });

    expect(screen.getByText(LABELS.statusOffline)).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: LABELS.updateNow }));
    expect(requestOfflineSync).not.toHaveBeenCalled();
  });

  it('muestra el progreso de la descarga de fotos', async () => {
    updateOfflineSyncStatus({ phase: 'syncing', files: { done: 3, total: 10 } });
    await render(<OfflineContentScreen />, { wrapper: Providers });

    expect(screen.getByText(LABELS.statusProgress(3, 10))).toBeTruthy();
  });

  it('sin copia guardada lo dice', async () => {
    jest.mocked(useSpeciesOfflineSummary).mockReturnValue(undefined);
    jest.mocked(useStationsOfflineCount).mockReturnValue(undefined);
    await render(<OfflineContentScreen />, { wrapper: Providers });

    expect(screen.getByText(LABELS.speciesEmpty)).toBeTruthy();
    expect(screen.getByText(LABELS.stationsEmpty)).toBeTruthy();
    expect(screen.getByText(LABELS.statusNever)).toBeTruthy();
  });
});
