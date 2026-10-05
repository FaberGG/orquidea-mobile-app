import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RoleProvider, type Role } from '@/permissions';

import { getSpecies, listSpecies } from '../api';
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
  photoUrl: null,
};

const CARACOL: Species = {
  ...AZULEJO,
  id: 'planta-1',
  category: 'plant',
  vernacularName: 'Helecho',
  scientificName: 'Azolla filiculoides',
  conservationStatus: 'CR',
};

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

beforeEach(() => {
  jest.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

afterEach(() => {
  queryClient.clear();
});

describe('SpeciesListScreen (HU-10)', () => {
  it('muestra las fichas y lleva al detalle al tocar una', async () => {
    jest.mocked(listSpecies).mockResolvedValue([AZULEJO, CARACOL]);
    await render(<SpeciesListScreen />, {
      wrapper: (props) => <Providers role="visitor" {...props} />,
    });

    expect(await screen.findByText('Azulejo')).toBeTruthy();
    expect(screen.getByText('Helecho')).toBeTruthy();
    expect(screen.getByText('Preocupación menor')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Azulejo' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/species/[id]',
      params: { id: 'ave-1' },
    });
  });

  it('filtra por categoría con cada chip y muestra el mensaje de HU-10 si está vacía', async () => {
    jest.mocked(listSpecies).mockResolvedValueOnce([AZULEJO, CARACOL]).mockResolvedValueOnce([]);
    await render(<SpeciesListScreen />, {
      wrapper: (props) => <Providers role="visitor" {...props} />,
    });
    await screen.findByText('Azulejo');

    expect(listSpecies).toHaveBeenLastCalledWith('all');
    fireEvent.press(screen.getByRole('tab', { name: 'Aves' }));

    await waitFor(() => expect(listSpecies).toHaveBeenLastCalledWith('bird'));
    expect(
      await screen.findByText('Aún no hay especies registradas en esta categoría.'),
    ).toBeTruthy();
  });

  it('no incluye búsqueda mientras la API no la tenga', async () => {
    jest.mocked(listSpecies).mockResolvedValue([]);
    await render(<SpeciesListScreen />, {
      wrapper: (props) => <Providers role="visitor" {...props} />,
    });
    await screen.findByText('Aún no hay especies registradas.');
    expect(screen.queryByLabelText(/buscar/i)).toBeNull();
  });
});

describe('SpeciesDetailScreen (HU-10 detalle, HU-8 y HU-9 por rol)', () => {
  async function renderDetail(role: Role) {
    jest.mocked(getSpecies).mockResolvedValue(AZULEJO);
    await render(<SpeciesDetailScreen id="ave-1" />, {
      wrapper: (props) => <Providers role={role} {...props} />,
    });
    expect(await screen.findByText('Azulejo')).toBeTruthy();
  }

  it('muestra la taxonomía y el rol en el humedal solo como texto', async () => {
    await renderDetail('visitor');
    expect(screen.getByText('Taxonomía')).toBeTruthy();
    expect(screen.getByText('Passeriformes')).toBeTruthy();
    expect(screen.getByText('Dispersor de semillas')).toBeTruthy();
    expect(screen.getByText('Rol en el humedal')).toBeTruthy();
  });

  it('el visitante y el usuario registrado no ven editar ni eliminar', async () => {
    await renderDetail('visitor');
    expect(screen.queryByText('Editar ficha')).toBeNull();
    expect(screen.queryByText('Eliminar ficha')).toBeNull();
  });

  it('el usuario registrado tampoco los ve', async () => {
    await renderDetail('user');
    expect(screen.queryByText('Editar ficha')).toBeNull();
    expect(screen.queryByText('Eliminar ficha')).toBeNull();
  });

  it('el administrador ve editar y eliminar', async () => {
    await renderDetail('admin');
    expect(screen.getByText('Editar ficha')).toBeTruthy();
    expect(screen.getByText('Eliminar ficha')).toBeTruthy();
  });

  it('muestra el mensaje de no encontrada cuando la ficha no existe', async () => {
    const { ApiError } = jest.requireActual('@/lib/api');
    jest
      .mocked(getSpecies)
      .mockRejectedValue(
        new ApiError({ status: 404, kind: 'http', path: '/api/fichas-taxonomicas/x' }),
      );
    await render(<SpeciesDetailScreen id="x" />, {
      wrapper: (props) => <Providers role="visitor" {...props} />,
    });
    expect(await screen.findByText('Esta ficha no existe o ya no está disponible.')).toBeTruthy();
  });
});
