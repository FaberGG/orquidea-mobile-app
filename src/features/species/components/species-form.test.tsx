import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
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
  photos: [],
};

const asset = (name: string, mimeType = 'image/jpeg') => ({
  uri: `file:///${name}.jpg`,
  fileName: `${name}.jpg`,
  mimeType,
  fileSize: 1000,
  width: 100,
  height: 100,
});

function pickAssets(...assets: ReturnType<typeof asset>[]) {
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
    canceled: false,
    assets,
  } as unknown as ImagePicker.ImagePickerResult);
}

const SAVED_PHOTOS = [
  { id: 'f1', url: 'http://localhost:9000/f1.jpg' },
  { id: 'f2', url: 'http://localhost:9000/f2.jpg' },
];

async function fillRequiredFields() {
  await fireEvent.changeText(screen.getByLabelText('Nombre común'), 'Martín pescador');
  await fireEvent.changeText(screen.getByLabelText('Nombre científico'), 'Ceryle torquata');
  await fireEvent.changeText(screen.getByLabelText('Orden'), 'Coraciiformes');
  await fireEvent.changeText(screen.getByLabelText('Familia'), 'Alcedinidae');
  await fireEvent.changeText(screen.getByLabelText('Género'), 'Ceryle');
  await fireEvent.changeText(screen.getByLabelText('Alimentación'), 'Peces');
  await fireEvent.changeText(screen.getByLabelText('Rol en el humedal'), 'Controlador de peces');
  await fireEvent.press(screen.getByRole('tab', { name: 'Aves' }));
  await fireEvent.press(screen.getByRole('radio', { name: 'Preocupación menor' }));
}

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

    await fireEvent.press(screen.getByText('Guardar cambios'));

    await waitFor(() =>
      expect(updateSpecies).toHaveBeenCalledWith(
        'ave-1',
        expect.objectContaining({
          category: 'bird',
          vernacularName: 'Azulejo',
          conservationStatus: 'LC',
          newPhotos: [],
          removedPhotoIds: [],
        }),
        expect.anything(),
      ),
    );
    expect(await screen.findByText(SPECIES_MESSAGES.updateSuccess)).toBeTruthy();
  });

  it('ofrece las siete categorías y guarda una de las nuevas (v2.0)', async () => {
    jest.mocked(getSpecies).mockResolvedValue(AZULEJO);
    jest.mocked(updateSpecies).mockResolvedValue(AZULEJO);
    await render(<SpeciesEditScreen id="ave-1" />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });
    await waitFor(() => expect(screen.getByLabelText('Nombre común').props.value).toBe('Azulejo'), {
      timeout: 5000,
    });

    for (const label of [
      'Aves',
      'Plantas',
      'Insectos',
      'Mamíferos',
      'Reptiles',
      'Anfibios',
      'Hongos',
    ]) {
      expect(screen.getByRole('tab', { name: label })).toBeTruthy();
    }
    await fireEvent.press(screen.getByRole('tab', { name: 'Mamíferos' }));
    await fireEvent.press(screen.getByText('Guardar cambios'));

    await waitFor(() =>
      expect(updateSpecies).toHaveBeenCalledWith(
        'ave-1',
        expect.objectContaining({ category: 'mammal' }),
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

    await fireEvent.press(screen.getByText('Guardar cambios'));

    expect(await screen.findByText('Ya existe una ficha con ese nombre científico.')).toBeTruthy();
  });
});

describe('CreateSpeciesButton (botón + del encabezado)', () => {
  it('lo ve el administrador y lleva a crear ficha', async () => {
    await render(<CreateSpeciesButton />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });
    await fireEvent.press(screen.getByLabelText('Crear ficha'));
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

    await fireEvent.press(screen.getByRole('button', { name: 'Crear ficha' }));

    expect(await screen.findByText(SPECIES_MESSAGES.requiredFields)).toBeTruthy();
    expect(createSpecies).not.toHaveBeenCalled();
  });

  it('exige la fotografía al crear', async () => {
    await render(<SpeciesCreateScreen />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });

    await fireEvent.changeText(screen.getByLabelText('Nombre común'), 'Martín pescador');
    await fireEvent.changeText(screen.getByLabelText('Nombre científico'), 'Ceryle torquata');
    await fireEvent.changeText(screen.getByLabelText('Orden'), 'Coraciiformes');
    await fireEvent.changeText(screen.getByLabelText('Familia'), 'Alcedinidae');
    await fireEvent.changeText(screen.getByLabelText('Género'), 'Ceryle');
    await fireEvent.changeText(screen.getByLabelText('Alimentación'), 'Peces');
    await fireEvent.changeText(screen.getByLabelText('Rol en el humedal'), 'Controlador de peces');
    await fireEvent.press(screen.getByRole('tab', { name: 'Aves' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Preocupación menor' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Crear ficha' }));

    expect(await screen.findByText(SPECIES_MESSAGES.requiredFields)).toBeTruthy();
    expect(createSpecies).not.toHaveBeenCalled();
  });

  it('sube varias fotos y la primera queda como principal (CA4 v2.0)', async () => {
    jest.mocked(createSpecies).mockResolvedValue({ species: AZULEJO, pendingPhotos: [] });
    await render(<SpeciesCreateScreen />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });
    await fillRequiredFields();

    pickAssets(asset('uno'), asset('dos'));
    await fireEvent.press(screen.getByRole('button', { name: 'Subir fotografías' }));
    expect(await screen.findByText('Principal')).toBeTruthy();
    expect(screen.getByText('2/10')).toBeTruthy();
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsMultipleSelection: true, selectionLimit: 10 }),
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Crear ficha' }));

    await waitFor(() =>
      expect(createSpecies).toHaveBeenCalledWith(
        expect.objectContaining({
          newPhotos: [
            expect.objectContaining({ uri: 'file:///uno.jpg' }),
            expect.objectContaining({ uri: 'file:///dos.jpg' }),
          ],
        }),
      ),
    );
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
  });

  it('descarta los archivos con formato no permitido y conserva los válidos (CA3)', async () => {
    await render(<SpeciesCreateScreen />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });
    pickAssets(asset('uno'), asset('documento', 'image/gif'));
    await fireEvent.press(screen.getByRole('button', { name: 'Subir fotografías' }));

    expect(await screen.findByText(SPECIES_MESSAGES.invalidImage)).toBeTruthy();
    expect(screen.getByText('1/10')).toBeTruthy();
  });

  it('si una foto adicional no se subió, avisa y lleva a editar la ficha creada', async () => {
    jest.mocked(createSpecies).mockResolvedValue({
      species: AZULEJO,
      pendingPhotos: [
        { uri: 'file:///dos.jpg', fileName: 'dos.jpg', mimeType: 'image/jpeg', fileSize: 1000 },
      ],
    });
    await render(<SpeciesCreateScreen />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });
    await fillRequiredFields();
    pickAssets(asset('uno'), asset('dos'));
    await fireEvent.press(screen.getByRole('button', { name: 'Subir fotografías' }));
    await screen.findByText('2/10');
    await fireEvent.press(screen.getByRole('button', { name: 'Crear ficha' }));

    expect(await screen.findByText(SPECIES_MESSAGES.photosPartiallySaved(1))).toBeTruthy();
    await fireEvent.press(screen.getByText('Editar ficha'));
    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/species/[id]/edit',
      params: { id: 'ave-1' },
    });
  });
});

describe('SpeciesEditScreen (HU-8 con varias fotos)', () => {
  it('quita una foto guardada y la envía en `removedPhotoIds`', async () => {
    jest.mocked(getSpecies).mockResolvedValue({
      ...AZULEJO,
      photoUrl: SAVED_PHOTOS[0].url,
      photos: SAVED_PHOTOS,
    });
    jest.mocked(updateSpecies).mockResolvedValue(AZULEJO);
    await render(<SpeciesEditScreen id="ave-1" />, {
      wrapper: (props) => <Providers role="admin" {...props} />,
    });
    expect(await screen.findByText('2/10', {}, { timeout: 5000 })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Quitar foto 1' }));
    expect(screen.getByText('1/10')).toBeTruthy();
    // La ficha siempre conserva al menos una foto.
    expect(screen.queryByRole('button', { name: 'Quitar foto 1' })).toBeNull();

    await fireEvent.press(screen.getByText('Guardar cambios'));
    await waitFor(() =>
      expect(updateSpecies).toHaveBeenCalledWith(
        'ave-1',
        expect.objectContaining({ removedPhotoIds: ['f1'], newPhotos: [] }),
        expect.anything(),
      ),
    );
    expect(await screen.findByText(SPECIES_MESSAGES.updateSuccess)).toBeTruthy();
  });
});
