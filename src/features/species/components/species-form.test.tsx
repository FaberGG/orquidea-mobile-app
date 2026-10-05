import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RoleProvider, type Role } from '@/permissions';

import { createSpecies, getSpecies, updateSpecies } from '../api';
import { SPECIES_MESSAGES } from '../constants';
import { type Species } from '../types';
import { CreateSpeciesButton } from './create-species-button';
import { SpeciesCreateScreen } from './species-create-screen';
import { SpeciesEditScreen } from './species-edit-screen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('../api', () => ({
  createSpecies: jest.fn(),
  updateSpecies: jest.fn(),
  getSpecies: jest.fn(),
  listSpecies: jest.fn(),
}));

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

describe('SpeciesEditScreen (HU-8)', () => {
  it('carga la ficha en el formulario y guarda los cambios', async () => {
    jest.mocked(getSpecies).mockResolvedValue(AZULEJO);
    jest.mocked(updateSpecies).mockResolvedValue(AZULEJO);
    await render(<SpeciesEditScreen id="ave-1" />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });

    await waitFor(() => expect(screen.getByLabelText('Nombre común').props.value).toBe('Azulejo'), {
      timeout: 5000,
    });
    expect(screen.getByLabelText('Nombre científico').props.value).toBe('Thraupis episcopus');

    fireEvent.press(screen.getByText('Guardar cambios'));

    await waitFor(() =>
      expect(updateSpecies).toHaveBeenCalledWith(
        'ave-1',
        expect.objectContaining({
          category: 'bird',
          vernacularName: 'Azulejo',
          conservationStatus: 'LC',
          photo: null,
        }),
      ),
    );
    expect(await screen.findByText(SPECIES_MESSAGES.updateSuccess)).toBeTruthy();
  });

  it('muestra el mensaje del servidor si el nombre científico ya existe (409)', async () => {
    const { ApiError } = jest.requireActual('@/lib/api');
    jest.mocked(getSpecies).mockResolvedValue(AZULEJO);
    jest.mocked(updateSpecies).mockRejectedValue(
      new ApiError({
        status: 409,
        kind: 'http',
        path: '/api/fichas-taxonomicas/ave-1',
        serverMessage: 'Ya existe una ficha con ese nombre científico.',
      }),
    );
    await render(<SpeciesEditScreen id="ave-1" />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });
    await waitFor(() => expect(screen.getByLabelText('Nombre común').props.value).toBe('Azulejo'), {
      timeout: 5000,
    });

    fireEvent.press(screen.getByText('Guardar cambios'));

    expect(await screen.findByText('Ya existe una ficha con ese nombre científico.')).toBeTruthy();
  });
});

describe('CreateSpeciesButton (botón + del encabezado)', () => {
  it('lo ve el administrador y lleva a crear ficha', async () => {
    await render(<CreateSpeciesButton />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });
    fireEvent.press(screen.getByLabelText('Crear ficha'));
    expect(router.push).toHaveBeenCalledWith('/species/new');
  });

  it('lo ve el superadministrador', async () => {
    await render(<CreateSpeciesButton />, {
      wrapper: (props) => <Providers role="superadmin" {...props} />,
    });
    expect(screen.getByLabelText('Crear ficha')).toBeTruthy();
  });

  it('no lo ven el visitante ni el usuario registrado', async () => {
    await render(<CreateSpeciesButton />, {
      wrapper: (props) => <Providers role="user" {...props} />,
    });
    expect(screen.queryByLabelText('Crear ficha')).toBeNull();
  });
});

describe('SpeciesCreateScreen (HU-7)', () => {
  it('pide los campos obligatorios y no envía nada incompleto', async () => {
    await render(<SpeciesCreateScreen />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });

    fireEvent.press(screen.getByRole('button', { name: 'Crear ficha' }));

    expect(await screen.findByText(SPECIES_MESSAGES.requiredFields)).toBeTruthy();
    expect(createSpecies).not.toHaveBeenCalled();
  });

  it('exige la fotografía al crear', async () => {
    await render(<SpeciesCreateScreen />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });

    fireEvent.changeText(screen.getByLabelText('Nombre común'), 'Martín pescador');
    fireEvent.changeText(screen.getByLabelText('Nombre científico'), 'Ceryle torquata');
    fireEvent.changeText(screen.getByLabelText('Orden'), 'Coraciiformes');
    fireEvent.changeText(screen.getByLabelText('Familia'), 'Alcedinidae');
    fireEvent.changeText(screen.getByLabelText('Género'), 'Ceryle');
    fireEvent.changeText(screen.getByLabelText('Alimentación'), 'Peces');
    fireEvent.changeText(screen.getByLabelText('Rol en el humedal'), 'Controlador de peces');
    fireEvent.press(screen.getByRole('tab', { name: 'Aves' }));
    fireEvent.press(screen.getByRole('radio', { name: 'Preocupación menor' }));

    fireEvent.press(screen.getByRole('button', { name: 'Crear ficha' }));

    expect(await screen.findByText(SPECIES_MESSAGES.requiredFields)).toBeTruthy();
    expect(createSpecies).not.toHaveBeenCalled();
  });
});
