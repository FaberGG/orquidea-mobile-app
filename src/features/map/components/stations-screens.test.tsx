import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { type ReactElement, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useSpeciesList } from '@/features/species';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { ApiError } from '@/lib/api';
import { RoleProvider, type Role } from '@/permissions';

import { createStation, deleteStation, getStation, listStations, updateStation } from '../api';
import { getTrailMap } from '../api/map.api';
import { LOCATION_PICKER_LABELS, STATION_LABELS, STATION_MESSAGES } from '../constants';
import { type Station } from '../types';
import { StationCreateScreen } from './station-create-screen';
import { StationDetailScreen } from './station-detail-screen';
import { StationEditScreen } from './station-edit-screen';
import { StationsListScreen } from './stations-list-screen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('@/lib/location', () => ({ getCurrentLocation: jest.fn() }));
jest.mock('@/hooks/use-network-status', () => ({ useNetworkStatus: jest.fn() }));
jest.mock('../api/map.api', () => ({ getTrailMap: jest.fn() }));
jest.mock('@/features/species', () => ({ useSpeciesList: jest.fn() }));
jest.mock('../api', () => ({
  listStations: jest.fn(),
  getStation: jest.fn(),
  createStation: jest.fn(),
  updateStation: jest.fn(),
  deleteStation: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const MIRADOR: Station = {
  id: 'e-1',
  name: 'Mirador de la laguna',
  description: 'Desde aquí se observan garzas y patos.',
  photoUrl: 'http://localhost:9000/estaciones/e-1.jpg',
  location: { latitude: 2.4598, longitude: -76.6115 },
  species: [{ id: 'ave-1', vernacularName: 'Garza real', photoUrl: null }],
};

const SPECIES = [
  { id: 'ave-1', vernacularName: 'Garza real', scientificName: 'Ardea alba' },
  { id: 'ave-2', vernacularName: 'Azulejo', scientificName: 'Thraupis episcopus' },
];

let queryClient: QueryClient;

function Providers({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <RoleProvider role={role}>{children}</RoleProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

async function renderAs(role: Role, ui: ReactElement) {
  await render(ui, { wrapper: (props) => <Providers role={role} {...props} /> });
}

function pickPhoto(mimeType = 'image/jpeg') {
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
    canceled: false,
    assets: [{ uri: 'file:///mirador.jpg', fileName: 'mirador.jpg', mimeType, fileSize: 1000 }],
  } as unknown as ImagePicker.ImagePickerResult);
}

async function fillForm() {
  await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Mirador de la laguna');
  await fireEvent.changeText(screen.getByLabelText('Descripción'), 'Se observan garzas.');
  await fireEvent.changeText(screen.getByLabelText('Latitud'), '2,4598');
  await fireEvent.changeText(screen.getByLabelText('Longitud'), '-76.6115');
}

beforeEach(() => {
  jest.mocked(useNetworkStatus).mockReturnValue({ status: 'online', refresh: jest.fn() });
  jest.mocked(getTrailMap).mockRejectedValue(new Error('sin mapa en pruebas'));
});

beforeEach(() => {
  jest.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  jest.mocked(useSpeciesList).mockReturnValue({
    data: SPECIES,
    isPending: false,
    isError: false,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useSpeciesList>);
});

afterEach(() => queryClient.clear());

describe('StationsListScreen (HU-13, entrada provisional desde el menú)', () => {
  it('muestra las estaciones a cualquier rol y abre "Ver estación"', async () => {
    jest.mocked(listStations).mockResolvedValue([MIRADOR]);
    await renderAs('visitor', <StationsListScreen />);

    expect(await screen.findByText('Mirador de la laguna')).toBeTruthy();
    expect(screen.getByText('1 ficha')).toBeTruthy();
    expect(screen.queryByLabelText('Nueva estación')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Mirador de la laguna' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/stations/[id]', params: { id: 'e-1' } });
  });

  it('el administrador ve el botón para crear', async () => {
    jest.mocked(listStations).mockResolvedValue([]);
    await renderAs('admin', <StationsListScreen />);

    expect(await screen.findByText(STATION_MESSAGES.empty)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Nueva estación'));
    expect(router.push).toHaveBeenCalledWith('/stations/new');
  });
});

describe('StationDetailScreen ("Ver estación")', () => {
  it('muestra la estación y los enlaces a sus fichas (CA4), sin acciones para el visitante', async () => {
    jest.mocked(getStation).mockResolvedValue(MIRADOR);
    await renderAs('visitor', <StationDetailScreen id="e-1" />);

    expect(await screen.findByText('Mirador de la laguna')).toBeTruthy();
    expect(screen.getByText('2.459800, -76.611500')).toBeTruthy();
    expect(screen.queryByText('Editar estación')).toBeNull();
    expect(screen.queryByText('ELIMINAR')).toBeNull();

    await fireEvent.press(screen.getByRole('link', { name: 'Garza real' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/species/[id]',
      params: { id: 'ave-1' },
    });
  });

  it('el superadministrador puede editar', async () => {
    jest.mocked(getStation).mockResolvedValue(MIRADOR);
    await renderAs('superadmin', <StationDetailScreen id="e-1" />);

    await fireEvent.press(await screen.findByText('Editar estación'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/stations/[id]/edit',
      params: { id: 'e-1' },
    });
  });

  it('ELIMINAR y CANCELAR deja la estación sin cambios (CA5)', async () => {
    jest.mocked(getStation).mockResolvedValue(MIRADOR);
    await renderAs('admin', <StationDetailScreen id="e-1" />);

    await fireEvent.press(await screen.findByText('ELIMINAR'));
    expect(screen.getByText('¿Eliminar esta estación?')).toBeTruthy();
    await fireEvent.press(screen.getByText('CANCELAR'));

    expect(deleteStation).not.toHaveBeenCalled();
    expect(screen.queryByText('¿Eliminar esta estación?')).toBeNull();
  });

  it('ELIMINAR y CONFIRMAR la elimina y vuelve (CA5)', async () => {
    jest.mocked(getStation).mockResolvedValue(MIRADOR);
    jest.mocked(deleteStation).mockResolvedValue(undefined);
    await renderAs('admin', <StationDetailScreen id="e-1" />);

    await fireEvent.press(await screen.findByText('ELIMINAR'));
    await fireEvent.press(screen.getByText('CONFIRMAR'));

    await waitFor(() => expect(deleteStation).toHaveBeenCalledWith('e-1'));
    await waitFor(() => expect(router.back).toHaveBeenCalled());
  });

  it('avisa si la estación ya no existe', async () => {
    jest
      .mocked(getStation)
      .mockRejectedValue(new ApiError({ status: 404, kind: 'http', path: '/api/estaciones/x' }));
    await renderAs('visitor', <StationDetailScreen id="x" />);

    expect(await screen.findByText(STATION_MESSAGES.notFound)).toBeTruthy();
  });
});

describe('StationCreateScreen (HU-13 CA1, CA3, CA4)', () => {
  it('rechaza coordenadas fuera de rango sin enviar (CA3)', async () => {
    await renderAs('admin', <StationCreateScreen />);
    await fillForm();
    await fireEvent.changeText(screen.getByLabelText('Latitud'), '95');
    await fireEvent.press(screen.getByText('GUARDAR ESTACIÓN'));

    expect(await screen.findByText(STATION_MESSAGES.invalidCoordinates)).toBeTruthy();
    expect(createStation).not.toHaveBeenCalled();
  });

  it('exige la foto al crear', async () => {
    await renderAs('admin', <StationCreateScreen />);
    await fillForm();
    await fireEvent.press(screen.getByText('GUARDAR ESTACIÓN'));

    expect(await screen.findByText(STATION_MESSAGES.requiredFields)).toBeTruthy();
    expect(createStation).not.toHaveBeenCalled();
  });

  it('guarda la estación con sus fichas y abre su detalle (CA1, CA4)', async () => {
    jest.mocked(createStation).mockResolvedValue(MIRADOR);
    await renderAs('admin', <StationCreateScreen />);
    await fillForm();
    pickPhoto();
    await fireEvent.press(screen.getByRole('button', { name: 'Subir fotografía' }));
    await screen.findByRole('button', { name: 'Cambiar foto' });
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Garza real' }));
    expect(screen.getByText('1 ficha seleccionada')).toBeTruthy();

    await fireEvent.press(screen.getByText('GUARDAR ESTACIÓN'));

    await waitFor(() =>
      expect(createStation).toHaveBeenCalledWith({
        name: 'Mirador de la laguna',
        description: 'Se observan garzas.',
        location: { latitude: 2.4598, longitude: -76.6115 },
        speciesIds: ['ave-1'],
        photo: expect.objectContaining({ uri: 'file:///mirador.jpg' }),
      }),
    );
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/stations/[id]',
        params: { id: 'e-1' },
      }),
    );
  });

  it('muestra el mensaje del servidor si la API rechaza la estación', async () => {
    jest.mocked(createStation).mockRejectedValue(
      new ApiError({
        status: 400,
        kind: 'http',
        path: '/api/estaciones',
        serverMessage: STATION_MESSAGES.invalidCoordinates,
      }),
    );
    await renderAs('admin', <StationCreateScreen />);
    await fillForm();
    pickPhoto();
    await fireEvent.press(screen.getByRole('button', { name: 'Subir fotografía' }));
    await screen.findByRole('button', { name: 'Cambiar foto' });
    await fireEvent.press(screen.getByText('GUARDAR ESTACIÓN'));

    expect(await screen.findByText(STATION_MESSAGES.invalidCoordinates)).toBeTruthy();
  });

  it('rechaza una imagen con formato no permitido', async () => {
    await renderAs('admin', <StationCreateScreen />);
    pickPhoto('image/gif');
    await fireEvent.press(screen.getByRole('button', { name: 'Subir fotografía' }));

    expect(await screen.findByText(STATION_MESSAGES.invalidImage)).toBeTruthy();
  });
});

describe('StationEditScreen (HU-13 CA2)', () => {
  it('carga la estación, quita una ficha y muestra el mensaje del CA2', async () => {
    jest.mocked(getStation).mockResolvedValue(MIRADOR);
    jest.mocked(updateStation).mockResolvedValue({ ...MIRADOR, species: [] });
    await renderAs('admin', <StationEditScreen id="e-1" />);

    await waitFor(() =>
      expect(screen.getByLabelText('Nombre').props.value).toBe('Mirador de la laguna'),
    );
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Garza real' }));
    await fireEvent.press(screen.getByText('GUARDAR CAMBIOS'));

    await waitFor(() =>
      expect(updateStation).toHaveBeenCalledWith(
        'e-1',
        expect.objectContaining({ speciesIds: [], photo: null }),
      ),
    );
    expect(await screen.findByText('La estación se actualizó correctamente.')).toBeTruthy();
  });
});

describe('Selector de ubicación en el mapa (SCRUM-72)', () => {
  it('con conexión, elige el punto tocando el mapa y llena las coordenadas', async () => {
    await renderAs('admin', <StationCreateScreen />);

    await fireEvent.press(screen.getByText(LOCATION_PICKER_LABELS.open));
    expect(await screen.findByText(LOCATION_PICKER_LABELS.title)).toBeTruthy();

    await fireEvent(screen.getByLabelText(LOCATION_PICKER_LABELS.mapLabel), 'press', {
      nativeEvent: { coordinate: { latitude: 2.4612345, longitude: -76.6123456 } },
    });
    expect(screen.getByText('2.461235, -76.612346')).toBeTruthy();
    await fireEvent.press(screen.getByText(LOCATION_PICKER_LABELS.confirm));

    expect(screen.getByLabelText('Latitud').props.value).toBe('2.461235');
    expect(screen.getByLabelText('Longitud').props.value).toBe('-76.612346');
    expect(screen.getByText(LOCATION_PICKER_LABELS.change)).toBeTruthy();
  });

  it('el marcador se puede arrastrar para ajustar el punto', async () => {
    await renderAs('admin', <StationCreateScreen />);
    await fireEvent.press(screen.getByText(LOCATION_PICKER_LABELS.open));
    await fireEvent(await screen.findByLabelText(LOCATION_PICKER_LABELS.mapLabel), 'press', {
      nativeEvent: { coordinate: { latitude: 2.46, longitude: -76.61 } },
    });

    await fireEvent(screen.getByLabelText(LOCATION_PICKER_LABELS.selectedPoint), 'dragEnd', {
      nativeEvent: { coordinate: { latitude: 2.47, longitude: -76.62 } },
    });

    expect(screen.getByText('2.470000, -76.620000')).toBeTruthy();
  });

  it('CANCELAR no cambia las coordenadas', async () => {
    await renderAs('admin', <StationCreateScreen />);
    await fireEvent.press(screen.getByText(LOCATION_PICKER_LABELS.open));
    await fireEvent(await screen.findByLabelText(LOCATION_PICKER_LABELS.mapLabel), 'press', {
      nativeEvent: { coordinate: { latitude: 2.46, longitude: -76.61 } },
    });
    await fireEvent.press(screen.getByText(LOCATION_PICKER_LABELS.cancel));

    expect(screen.getByLabelText('Latitud').props.value).toBe('');
  });

  it('sin conexión no ofrece el mapa y se mantiene el GPS', async () => {
    jest.mocked(useNetworkStatus).mockReturnValue({ status: 'offline', refresh: jest.fn() });
    await renderAs('admin', <StationCreateScreen />);

    expect(screen.queryByText(LOCATION_PICKER_LABELS.open)).toBeNull();
    expect(screen.getByText(STATION_LABELS.useCurrentLocation)).toBeTruthy();
  });
});
