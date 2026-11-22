import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiError } from '@/lib/api';
import { registerOfflineQueries } from '@/lib/offline';
import { RoleProvider } from '@/permissions';

import { getSpecies, syncSpecies } from '../api';
import { LEGACY_SPECIES_LIST_KEY, SPECIES_LABELS, speciesKeys } from '../constants';
import { prefetchSpeciesForOffline } from '../hooks';
import { type Species, type SpeciesCatalog, type SpeciesSync } from '../types';
import { SpeciesDetailScreen } from './species-detail-screen';
import { SpeciesListScreen } from './species-list-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('../api', () => ({ syncSpecies: jest.fn(), getSpecies: jest.fn() }));

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
  thumbnailUrl: 'https://r2.example/miniaturas/azulejo-1.jpg',
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
  thumbnailUrl: null,
  photos: [],
};

const sync = (overrides: Partial<SpeciesSync>): SpeciesSync => ({
  syncedAt: 'T1',
  complete: true,
  species: [],
  deletedIds: [],
  ...overrides,
});

const catalog = () => queryClient.getQueryData<SpeciesCatalog>(speciesKeys.catalog());

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
  it('primera descarga: guarda la copia con su cursor, siembra el detalle y devuelve las fotos', async () => {
    jest.mocked(syncSpecies).mockResolvedValue(sync({ species: [HELECHO, AZULEJO] }));

    const urls = await prefetchSpeciesForOffline(queryClient);

    expect(syncSpecies).toHaveBeenCalledWith(null);
    expect(urls).toEqual([
      'https://r2.example/miniaturas/azulejo-1.jpg',
      'https://r2.example/azulejo-1.jpg',
      'https://r2.example/azulejo-2.jpg',
    ]);
    expect(catalog()).toEqual({ syncedAt: 'T1', species: [AZULEJO, HELECHO] });
    expect(queryClient.getQueryData(speciesKeys.detail('planta-1'))).toEqual(HELECHO);
    const detail = queryClient.getQueryCache().find({ queryKey: speciesKeys.detail('ave-1') });
    expect(detail?.meta?.persist).toBe(true);
    const saved = queryClient.getQueryCache().find({ queryKey: speciesKeys.catalog() });
    expect(saved?.meta?.persist).toBe(true);
  });

  it('por cambios: envía el cursor, reemplaza las fichas repetidas y quita las eliminadas', async () => {
    const editado = { ...AZULEJO, vernacularName: 'Azulejo común' };
    const nueva = { ...HELECHO, id: 'planta-2', vernacularName: 'Buchón' };
    jest
      .mocked(syncSpecies)
      .mockResolvedValueOnce(sync({ species: [AZULEJO, HELECHO] }))
      .mockResolvedValueOnce(
        sync({
          syncedAt: 'T2',
          complete: false,
          species: [editado, nueva],
          deletedIds: ['planta-1', 'nunca-descargada'],
        }),
      );

    await prefetchSpeciesForOffline(queryClient);
    const urls = await prefetchSpeciesForOffline(queryClient);

    expect(syncSpecies).toHaveBeenLastCalledWith('T1');
    expect(catalog()).toEqual({ syncedAt: 'T2', species: [editado, nueva] });
    expect(queryClient.getQueryData(speciesKeys.detail('ave-1'))).toEqual(editado);
    expect(queryClient.getQueryData(speciesKeys.detail('planta-1'))).toBeUndefined();
    expect(urls).toContain('https://r2.example/azulejo-2.jpg');
  });

  it('una sincronización completa quita las fichas y detalles que no vengan', async () => {
    queryClient.setQueryData(speciesKeys.catalog(), {
      syncedAt: 'T1',
      species: [AZULEJO, HELECHO],
    });
    queryClient.setQueryData(speciesKeys.detail('planta-1'), HELECHO);
    jest.mocked(syncSpecies).mockResolvedValue(sync({ syncedAt: 'T2', species: [AZULEJO] }));

    await prefetchSpeciesForOffline(queryClient);

    expect(syncSpecies).toHaveBeenCalledWith('T1');
    expect(catalog()?.species).toEqual([AZULEJO]);
    expect(queryClient.getQueryData(speciesKeys.detail('planta-1'))).toBeUndefined();
  });

  it('si el servidor rechaza el cursor (400), descarga todo de nuevo', async () => {
    queryClient.setQueryData(speciesKeys.catalog(), { syncedAt: 'roto', species: [HELECHO] });
    jest
      .mocked(syncSpecies)
      .mockRejectedValueOnce(new ApiError({ status: 400, kind: 'http', path: '/sincronizacion' }))
      .mockResolvedValueOnce(sync({ syncedAt: 'T2', species: [AZULEJO] }));

    await prefetchSpeciesForOffline(queryClient);

    expect(jest.mocked(syncSpecies).mock.calls).toEqual([['roto'], [null]]);
    expect(catalog()).toEqual({ syncedAt: 'T2', species: [AZULEJO] });
  });

  it('si falla la red conserva la copia guardada', async () => {
    queryClient.setQueryData(speciesKeys.catalog(), { syncedAt: 'T1', species: [AZULEJO] });
    jest.mocked(syncSpecies).mockRejectedValue(new Error('sin red'));

    await expect(prefetchSpeciesForOffline(queryClient)).rejects.toThrow('sin red');
    expect(catalog()).toEqual({ syncedAt: 'T1', species: [AZULEJO] });
  });

  it('borra la copia del formato anterior tras sincronizar', async () => {
    queryClient.setQueryData(LEGACY_SPECIES_LIST_KEY, [AZULEJO]);
    jest.mocked(syncSpecies).mockResolvedValue(sync({ species: [AZULEJO] }));

    await prefetchSpeciesForOffline(queryClient);

    expect(queryClient.getQueryData(LEGACY_SPECIES_LIST_KEY)).toBeUndefined();
  });
});

describe('fichas sin conexión (HU-21)', () => {
  it('CA1: muestra el listado guardado y filtra por categoría sin pedirlo a la API', async () => {
    queryClient.setQueryData(speciesKeys.catalog(), {
      syncedAt: 'T1',
      species: [AZULEJO, HELECHO],
    });
    onlineManager.setOnline(false);
    await render(<SpeciesListScreen />, { wrapper: Providers });

    expect(await screen.findByText('Azulejo')).toBeTruthy();
    fireEvent.press(screen.getByRole('tab', { name: 'Plantas' }));

    expect(await screen.findByText('Helecho')).toBeTruthy();
    expect(screen.queryByText('Azulejo')).toBeNull();
    expect(syncSpecies).not.toHaveBeenCalled();
  });

  it('CA2: sin copia guardada muestra el mensaje de información no disponible', async () => {
    onlineManager.setOnline(false);
    await render(<SpeciesListScreen />, { wrapper: Providers });

    expect(await screen.findByText(SPECIES_LABELS.offlineUnavailable)).toBeTruthy();
    expect(syncSpecies).not.toHaveBeenCalled();
  });

  it('CA1: tras actualizar la app sin conexión muestra la copia del formato anterior', async () => {
    queryClient.setQueryData(LEGACY_SPECIES_LIST_KEY, [HELECHO, AZULEJO]);
    onlineManager.setOnline(false);
    await render(<SpeciesListScreen />, { wrapper: Providers });

    expect(await screen.findByText('Azulejo')).toBeTruthy();
    expect(screen.getByText('Helecho')).toBeTruthy();
    expect(syncSpecies).not.toHaveBeenCalled();
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
