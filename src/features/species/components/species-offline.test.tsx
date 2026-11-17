import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { registerOfflineQueries } from '@/lib/offline';
import { RoleProvider } from '@/permissions';

import { getSpecies, listSpecies } from '../api';
import { SPECIES_LABELS, speciesKeys } from '../constants';
import { prefetchSpeciesForOffline } from '../hooks';
import { type Species } from '../types';
import { SpeciesDetailScreen } from './species-detail-screen';
import { SpeciesListScreen } from './species-list-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('../api', () => ({ listSpecies: jest.fn(), getSpecies: jest.fn() }));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const AZULEJO: Species = {
  id: 'ave-1',
  category: 'bird',
  order: 'Passeriformes',
  family: 'Thraupidae',
  genus: 'Thraupis',
  scientificName: 'Thraupis episcopus',
  vernacularName: 'Azulejo',
  diet: 'Frutos y néctar',
  wetlandRole: 'Dispersor de semillas',
  conservationStatus: 'LC',
  photoUrl: 'https://r2.example/azulejo-1.jpg',
  photos: [
    { id: 'f1', url: 'https://r2.example/azulejo-1.jpg' },
    { id: 'f2', url: 'https://r2.example/azulejo-2.jpg' },
  ],
};

const HELECHO: Species = {
  ...AZULEJO,
  id: 'planta-1',
  category: 'plant',
  vernacularName: 'Helecho',
  scientificName: 'Azolla filiculoides',
  photoUrl: null,
  photos: [],
};

let queryClient: QueryClient;

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <RoleProvider role="visitor">{children}</RoleProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  registerOfflineQueries(queryClient, speciesKeys.all);
});

afterEach(() => {
  onlineManager.setOnline(true);
  queryClient.clear();
});

describe('prefetchSpeciesForOffline (HU-21)', () => {
  it('descarga el listado, siembra el detalle de cada ficha y devuelve sus fotos', async () => {
    jest.mocked(listSpecies).mockResolvedValue([AZULEJO, HELECHO]);

    const urls = await prefetchSpeciesForOffline(queryClient);

    expect(listSpecies).toHaveBeenCalledWith('all');
    expect(urls).toEqual(['https://r2.example/azulejo-1.jpg', 'https://r2.example/azulejo-2.jpg']);
    expect(queryClient.getQueryData(speciesKeys.detail('planta-1'))).toEqual(HELECHO);
    const detail = queryClient.getQueryCache().find({ queryKey: speciesKeys.detail('ave-1') });
    expect(detail?.meta?.persist).toBe(true);
  });
});

describe('prefetchSpeciesForOffline: fichas eliminadas', () => {
  it('quita la copia guardada de las fichas que ya no existen en el servidor', async () => {
    queryClient.setQueryData(speciesKeys.detail('borrada'), { ...HELECHO, id: 'borrada' });
    jest.mocked(listSpecies).mockResolvedValue([AZULEJO]);

    await prefetchSpeciesForOffline(queryClient);

    expect(queryClient.getQueryData(speciesKeys.detail('borrada'))).toBeUndefined();
    expect(queryClient.getQueryData(speciesKeys.detail('ave-1'))).toEqual(AZULEJO);
  });
});

describe('fichas sin conexión (HU-21)', () => {
  it('CA1: muestra el listado guardado y filtra por categoría sin pedirlo a la API', async () => {
    queryClient.setQueryData(speciesKeys.list('all'), [AZULEJO, HELECHO]);
    onlineManager.setOnline(false);
    await render(<SpeciesListScreen />, { wrapper: Providers });

    expect(await screen.findByText('Azulejo')).toBeTruthy();
    fireEvent.press(screen.getByRole('tab', { name: 'Plantas' }));

    expect(await screen.findByText('Helecho')).toBeTruthy();
    expect(screen.queryByText('Azulejo')).toBeNull();
    expect(listSpecies).not.toHaveBeenCalled();
  });

  it('CA2: sin copia guardada muestra el mensaje de información no disponible', async () => {
    onlineManager.setOnline(false);
    await render(<SpeciesListScreen />, { wrapper: Providers });

    expect(await screen.findByText(SPECIES_LABELS.offlineUnavailable)).toBeTruthy();
    expect(listSpecies).not.toHaveBeenCalled();
  });

  it('CA1: abre el detalle guardado de una ficha', async () => {
    queryClient.setQueryData(speciesKeys.detail('ave-1'), AZULEJO);
    onlineManager.setOnline(false);
    await render(<SpeciesDetailScreen id="ave-1" />, { wrapper: Providers });

    expect(await screen.findByText('Frutos y néctar')).toBeTruthy();
    expect(getSpecies).not.toHaveBeenCalled();
  });

  it('CA2: el detalle de una ficha no descargada pide conexión', async () => {
    onlineManager.setOnline(false);
    await render(<SpeciesDetailScreen id="ave-9" />, { wrapper: Providers });

    expect(
      await screen.findByText(
        'Esta información no está disponible sin conexión. Conéctate a internet para descargarla.',
      ),
    ).toBeTruthy();
  });
});
