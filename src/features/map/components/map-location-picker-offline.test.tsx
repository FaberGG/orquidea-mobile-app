import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { getCurrentLocation } from '@/lib/location';

import { LOCATION_PICKER_LABELS, MAP_STYLE_URL } from '../constants';
import { MapLocationPicker } from './map-location-picker';
import { useOfflineTiles } from '../hooks/use-offline-tiles';

jest.mock('@/hooks/use-network-status', () => ({ useNetworkStatus: jest.fn() }));
jest.mock('@/lib/location', () => ({ getCurrentLocation: jest.fn() }));
jest.mock('../hooks/use-offline-tiles', () => ({ useOfflineTiles: jest.fn() }));
jest.mock('../hooks/use-trail-map', () => ({ useTrailMap: () => ({ data: undefined }) }));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const TILES_URL = 'pmtiles://file://doc/bundled-maps/popayan-z14-abc.pmtiles';

function setNetwork(status: 'online' | 'offline' | 'unknown') {
  jest.mocked(useNetworkStatus).mockReturnValue({ status, refresh: jest.fn() });
}

async function renderPicker(onConfirm = jest.fn()) {
  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <MapLocationPicker visible value={null} onConfirm={onConfirm} onCancel={jest.fn()} />
    </SafeAreaProvider>,
  );
  return onConfirm;
}

async function tapMap(longitude: number, latitude: number) {
  await fireEvent(screen.getByLabelText(LOCATION_PICKER_LABELS.mapLabel), 'press', {
    nativeEvent: { lngLat: [longitude, latitude] },
  });
}

beforeEach(() => {
  jest.mocked(useOfflineTiles).mockReturnValue({ status: 'ready', url: TILES_URL });
  jest.mocked(getCurrentLocation).mockReset();
});

describe('MapLocationPicker sin conexión (SCRUM-85)', () => {
  it('con conexión usa OpenFreeMap y no muestra el GPS ni avisos', async () => {
    setNetwork('online');
    await renderPicker();

    expect(screen.getByLabelText(LOCATION_PICKER_LABELS.mapLabel).props.mapStyle).toBe(
      MAP_STYLE_URL,
    );
    expect(screen.queryByText(LOCATION_PICKER_LABELS.offlineHint)).toBeNull();
    expect(screen.queryByText(LOCATION_PICKER_LABELS.useGps)).toBeNull();
    expect(jest.mocked(useOfflineTiles)).toHaveBeenLastCalledWith(false);
  });

  it('sin conexión usa el PMTiles incluido y permite elegir el punto en Popayán', async () => {
    setNetwork('offline');
    const onConfirm = await renderPicker();

    const { mapStyle } = screen.getByLabelText(LOCATION_PICKER_LABELS.mapLabel).props;
    expect(mapStyle.sources.openmaptiles.url).toBe(TILES_URL);
    expect(screen.getByText(LOCATION_PICKER_LABELS.offlineHint)).toBeTruthy();

    await tapMap(-76.6115, 2.4598);
    expect(screen.queryByText(LOCATION_PICKER_LABELS.outsideOfflineArea)).toBeNull();
    await fireEvent.press(screen.getByText(LOCATION_PICKER_LABELS.confirm));
    expect(onConfirm).toHaveBeenCalledWith({ latitude: 2.4598, longitude: -76.6115 });
  });

  it('sin conexión avisa si el punto queda fuera del área offline', async () => {
    setNetwork('offline');
    await renderPicker();

    await tapMap(-74.0721, 4.711);
    expect(screen.getByText(LOCATION_PICKER_LABELS.outsideOfflineArea)).toBeTruthy();
  });

  it('sin conexión ofrece elegir el punto por GPS', async () => {
    setNetwork('offline');
    jest.mocked(getCurrentLocation).mockResolvedValue({
      status: 'located',
      coordinates: { latitude: 2.46, longitude: -76.61 },
    });
    await renderPicker();

    await fireEvent.press(screen.getByText(LOCATION_PICKER_LABELS.useGps));
    expect(await screen.findByText('2.460000, -76.610000')).toBeTruthy();
  });

  it('si se niega el permiso de ubicación, lo explica', async () => {
    setNetwork('offline');
    jest.mocked(getCurrentLocation).mockResolvedValue({ status: 'denied' });
    await renderPicker();

    await fireEvent.press(screen.getByText(LOCATION_PICKER_LABELS.useGps));
    expect(await screen.findByText(LOCATION_PICKER_LABELS.locationDenied)).toBeTruthy();
  });

  it('mientras prepara el mapa offline lo indica, y si falla deja el GPS', async () => {
    setNetwork('offline');
    jest.mocked(useOfflineTiles).mockReturnValue({ status: 'loading' });
    await renderPicker();
    expect(screen.getByText(LOCATION_PICKER_LABELS.offlineMapLoading)).toBeTruthy();
    expect(screen.queryByLabelText(LOCATION_PICKER_LABELS.mapLabel)).toBeNull();

    jest.mocked(useOfflineTiles).mockReturnValue({ status: 'error' });
    await renderPicker();
    expect(screen.getByText(LOCATION_PICKER_LABELS.offlineMapUnavailable)).toBeTruthy();
    expect(screen.getAllByText(LOCATION_PICKER_LABELS.useGps).length).toBeGreaterThan(0);
  });
});
