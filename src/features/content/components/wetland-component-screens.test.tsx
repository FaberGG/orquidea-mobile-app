import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiError } from '@/lib/api';
import { RoleProvider, type Role } from '@/permissions';

import { getWetlandComponent, listWetlandComponents, saveWetlandComponentChanges } from '../api';
import { CONTENT_MESSAGES, WETLAND_LABELS } from '../constants';
import { type WetlandComponent } from '../types';
import { EditWetlandComponentScreen } from './edit-wetland-component-screen';
import { pickComponentPhoto } from './pick-component-photo';
import { WetlandComponentDetailScreen } from './wetland-component-detail-screen';
import { WetlandComponentsScreen } from './wetland-components-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('../api', () => ({
  listWetlandComponents: jest.fn(),
  getWetlandComponent: jest.fn(),
  saveWetlandComponentChanges: jest.fn(),
}));
jest.mock('./pick-component-photo', () => ({ pickComponentPhoto: jest.fn() }));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const AVES: WetlandComponent = {
  type: 'AVES',
  name: 'Aves',
  description: 'El humedal alberga especies residentes y migratorias.',
  hasContent: true,
  photos: [
    { id: 'f1', url: 'http://localhost:9000/orquidea/componentes/f1.jpg' },
    { id: 'f2', url: 'http://localhost:9000/orquidea/componentes/f2.png' },
  ],
  updatedAt: '2026-10-09T15:30:00.123456Z',
};

const FLORA_EMPTY: WetlandComponent = {
  type: 'FLORA',
  name: 'Flora',
  description: '',
  hasContent: false,
  photos: [],
  updatedAt: null,
};

const NEW_PHOTO = {
  uri: 'file:///garza.jpg',
  mimeType: 'image/jpeg',
  fileName: 'garza.jpg',
} as const;

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

const wrapperFor = (role: Role) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <Providers role={role}>{children}</Providers>;
  };

beforeEach(() => {
  jest.clearAllMocks();
  // gcTime infinito: evita timers pendientes que impiden que Jest termine al desmontar.
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
});

afterEach(() => {
  queryClient.clear();
});

describe('WetlandComponentsScreen (HU-14)', () => {
  it('muestra un botón por componente y abre el detalle al tocarlo', async () => {
    jest.mocked(listWetlandComponents).mockResolvedValue([AVES, FLORA_EMPTY]);
    await render(<WetlandComponentsScreen />, { wrapper: wrapperFor('visitor') });

    expect(await screen.findByRole('button', { name: 'Aves' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Flora' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Aves' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/wetland/[type]',
      params: { type: 'AVES' },
    });
  });

  it('si falla la carga permite reintentar', async () => {
    jest
      .mocked(listWetlandComponents)
      .mockRejectedValueOnce(new ApiError({ status: 0, kind: 'network', path: '/api/componentes' }))
      .mockResolvedValueOnce([AVES]);
    await render(<WetlandComponentsScreen />, { wrapper: wrapperFor('visitor') });

    expect(await screen.findByText(CONTENT_MESSAGES.componentsLoadError)).toBeTruthy();
    await fireEvent.press(screen.getByText(WETLAND_LABELS.retry));
    expect(await screen.findByRole('button', { name: 'Aves' })).toBeTruthy();
  });
});

describe('WetlandComponentDetailScreen (HU-14)', () => {
  it('CA1: muestra la descripción y las imágenes del componente', async () => {
    jest.mocked(getWetlandComponent).mockResolvedValue(AVES);
    await render(<WetlandComponentDetailScreen type="AVES" />, {
      wrapper: wrapperFor('visitor'),
    });

    expect(await screen.findByText(AVES.description)).toBeTruthy();
    expect(screen.getAllByLabelText(WETLAND_LABELS.photoOf('Aves'))).toHaveLength(2);
    expect(screen.queryByText(CONTENT_MESSAGES.componentWithoutContent)).toBeNull();
  });

  it('CA2: sin información publicada muestra "La información de esta sección estará disponible próximamente."', async () => {
    jest.mocked(getWetlandComponent).mockResolvedValue(FLORA_EMPTY);
    await render(<WetlandComponentDetailScreen type="FLORA" />, {
      wrapper: wrapperFor('visitor'),
    });

    expect(await screen.findByText(CONTENT_MESSAGES.componentWithoutContent)).toBeTruthy();
  });

  it('el visitante y el usuario no ven el botón de editar', async () => {
    jest.mocked(getWetlandComponent).mockResolvedValue(AVES);
    await render(<WetlandComponentDetailScreen type="AVES" />, { wrapper: wrapperFor('user') });

    expect(await screen.findByText(AVES.description)).toBeTruthy();
    expect(screen.queryByText(WETLAND_LABELS.editButton)).toBeNull();
  });

  it('el administrador ve EDITAR CONTENIDO y lleva a la edición (content:manage)', async () => {
    jest.mocked(getWetlandComponent).mockResolvedValue(FLORA_EMPTY);
    await render(<WetlandComponentDetailScreen type="FLORA" />, { wrapper: wrapperFor('admin') });

    await fireEvent.press(await screen.findByText(WETLAND_LABELS.editButton));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/wetland/[type]/edit',
      params: { type: 'FLORA' },
    });
  });

  it('un tipo que no existe muestra que no se encontró', async () => {
    jest
      .mocked(getWetlandComponent)
      .mockRejectedValue(new ApiError({ status: 404, kind: 'http', path: '/api/componentes/X' }));
    await render(<WetlandComponentDetailScreen type="X" />, { wrapper: wrapperFor('visitor') });

    expect(await screen.findByText(CONTENT_MESSAGES.componentNotFound)).toBeTruthy();
  });
});

describe('EditWetlandComponentScreen (HU-15)', () => {
  async function renderEdit(component: WetlandComponent = AVES) {
    jest.mocked(getWetlandComponent).mockResolvedValue(component);
    await render(<EditWetlandComponentScreen type={component.type} />, {
      wrapper: wrapperFor('admin'),
    });
    await screen.findByDisplayValue(component.name);
  }

  it('CA1: al guardar texto e imágenes muestra "El contenido del componente se actualizó correctamente."', async () => {
    jest.mocked(pickComponentPhoto).mockResolvedValue({ status: 'picked', photo: NEW_PHOTO });
    const updated: WetlandComponent = {
      ...AVES,
      description: 'Descripción nueva',
      photos: [AVES.photos[1], { id: 'f3', url: 'http://localhost:9000/f3.jpg' }],
    };
    jest.mocked(saveWetlandComponentChanges).mockResolvedValue(updated);
    await renderEdit();

    await fireEvent.changeText(
      screen.getByLabelText(WETLAND_LABELS.descriptionLabel),
      'Descripción nueva',
    );
    await fireEvent.press(screen.getAllByLabelText(WETLAND_LABELS.removePhoto)[0]);
    await fireEvent.press(screen.getByLabelText(WETLAND_LABELS.addPhoto));
    expect(await screen.findByText(WETLAND_LABELS.newPhotoBadge)).toBeTruthy();
    await fireEvent.press(screen.getByText(WETLAND_LABELS.saveButton));

    expect(await screen.findByText(CONTENT_MESSAGES.componentUpdated)).toBeTruthy();
    expect(saveWetlandComponentChanges).toHaveBeenCalledWith(
      'AVES',
      {
        name: 'Aves',
        description: 'Descripción nueva',
        removedPhotoIds: ['f1'],
        newPhotos: [NEW_PHOTO],
      },
      expect.any(Object),
    );
    expect(screen.queryByText(WETLAND_LABELS.newPhotoBadge)).toBeNull();
  });

  it('exige nombre y descripción', async () => {
    await renderEdit();

    await fireEvent.changeText(screen.getByLabelText(WETLAND_LABELS.descriptionLabel), '   ');
    await fireEvent.press(screen.getByText(WETLAND_LABELS.saveButton));

    expect(await screen.findByText(CONTENT_MESSAGES.componentRequiredFields)).toBeTruthy();
    expect(saveWetlandComponentChanges).not.toHaveBeenCalled();
  });

  it('rechaza una imagen que no es jpg ni png sin subirla', async () => {
    jest.mocked(pickComponentPhoto).mockResolvedValue({ status: 'invalid' });
    await renderEdit();

    await fireEvent.press(screen.getByLabelText(WETLAND_LABELS.addPhoto));

    expect(await screen.findByText(CONTENT_MESSAGES.photoInvalidFormat)).toBeTruthy();
  });

  it('con 10 fotos ya no permite agregar más', async () => {
    const photos = Array.from({ length: 10 }, (_, index) => ({
      id: `f${index}`,
      url: `http://localhost:9000/f${index}.jpg`,
    }));
    await renderEdit({ ...AVES, photos });

    expect(screen.getByText(WETLAND_LABELS.photosCounter(10, 10))).toBeTruthy();
    expect(screen.queryByLabelText(WETLAND_LABELS.addPhoto)).toBeNull();
    expect(screen.getByText(CONTENT_MESSAGES.photoLimitReached)).toBeTruthy();
  });

  it('muestra el mensaje del servidor si el guardado falla', async () => {
    jest.mocked(saveWetlandComponentChanges).mockRejectedValue(
      new ApiError({
        status: 403,
        kind: 'http',
        path: '/api/componentes/AVES',
        serverMessage: 'No tiene permisos para realizar esta acción.',
      }),
    );
    await renderEdit();

    await fireEvent.press(screen.getByText(WETLAND_LABELS.saveButton));

    await waitFor(() =>
      expect(screen.getByText('No tiene permisos para realizar esta acción.')).toBeTruthy(),
    );
    expect(screen.queryByText(CONTENT_MESSAGES.componentUpdated)).toBeNull();
  });
});
