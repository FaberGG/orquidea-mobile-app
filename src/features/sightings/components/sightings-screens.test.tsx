import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { type ReactElement, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RoleProvider, type Role } from '@/permissions';

import {
  createSighting,
  listApprovedSightings,
  listPendingSightings,
  reviewSighting,
} from '../api';
import { type Sighting, type SightingPage } from '../types';
import { CommunityScreen } from './community-screen';
import { NewSightingScreen } from './new-sighting-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('../api', () => ({
  listApprovedSightings: jest.fn(),
  listPendingSightings: jest.fn(),
  createSighting: jest.fn(),
  reviewSighting: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const APPROVED: Sighting = {
  id: 'r-1',
  remarks: 'Vi un ave azul comiendo frutos en el borde del humedal',
  kingdom: 'animalia',
  vernacularName: 'Azulejo',
  location: { latitude: 2.4598, longitude: -76.6115 },
  author: 'Ana Gómez',
  photoUrl: 'https://example.com/ave.jpg',
  status: 'approved',
  createdAt: '2026-10-08T15:30:00Z',
  reviewedAt: '2026-10-09T10:00:00Z',
};

const PENDING: Sighting = {
  ...APPROVED,
  id: 'r-2',
  remarks: 'Escuché un canto que no reconocí cerca del sendero',
  kingdom: 'unknown',
  vernacularName: null,
  location: null,
  photoUrl: null,
  author: 'Luis Pérez',
  status: 'pending',
  reviewedAt: null,
};

const page = (items: Sighting[]): SightingPage => ({ items, page: 0, totalPages: 1 });

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

beforeEach(() => {
  jest.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});

afterEach(() => {
  queryClient.clear();
});

describe('CommunityScreen — foro (HU-20)', () => {
  it('muestra los reportes aprobados con descripción, reino, clasificación, lugar y autor (CA1)', async () => {
    jest.mocked(listApprovedSightings).mockResolvedValue(page([APPROVED]));
    await renderAs('visitor', <CommunityScreen />);

    expect(await screen.findByText('Ana Gómez')).toBeTruthy();
    expect(screen.getByText(APPROVED.remarks)).toBeTruthy();
    expect(screen.getByText('Animal')).toBeTruthy();
    expect(screen.getByText('Azulejo')).toBeTruthy();
    expect(screen.getByText('2.45980, -76.61150')).toBeTruthy();
    expect(listApprovedSightings).toHaveBeenCalledWith(0);
  });

  it('abre la foto en el visor al tocarla', async () => {
    jest.mocked(listApprovedSightings).mockResolvedValue(page([APPROVED]));
    await renderAs('visitor', <CommunityScreen />);

    await fireEvent.press(await screen.findByLabelText('Ver foto completa'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/sightings/photo',
      params: { uri: APPROVED.photoUrl },
    });
  });

  it('muestra "Aún no hay avistamientos publicados." si no hay reportes (CA2)', async () => {
    jest.mocked(listApprovedSightings).mockResolvedValue(page([]));
    await renderAs('visitor', <CommunityScreen />);
    expect(await screen.findByText('Aún no hay avistamientos publicados.')).toBeTruthy();
  });
});

describe('CommunityScreen — botón para escribir un reporte', () => {
  beforeEach(() => {
    jest.mocked(listApprovedSightings).mockResolvedValue(page([]));
  });

  it('al visitante le pide iniciar sesión y lo lleva al login', async () => {
    await renderAs('visitor', <CommunityScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Escribir un reporte' }));

    expect(screen.getByText('Inicia sesión para reportar')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));
    expect(router.push).toHaveBeenCalledWith('/login');
  });

  it('al usuario registrado lo lleva al formulario', async () => {
    await renderAs('user', <CommunityScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Escribir un reporte' }));
    expect(router.push).toHaveBeenCalledWith('/sightings/new');
  });

  it('el administrador no lo ve: la API no le permite crear reportes', async () => {
    await renderAs('admin', <CommunityScreen />);
    await screen.findByText('Aún no hay avistamientos publicados.');
    expect(screen.queryByRole('button', { name: 'Escribir un reporte' })).toBeNull();
  });
});

describe('CommunityScreen — moderación (HU-19)', () => {
  beforeEach(() => {
    jest.mocked(listApprovedSightings).mockResolvedValue(page([]));
    jest.mocked(listPendingSightings).mockResolvedValue(page([PENDING]));
  });

  it('el usuario registrado no ve la pestaña de moderación', async () => {
    await renderAs('user', <CommunityScreen />);
    await screen.findByText('Aún no hay avistamientos publicados.');
    expect(screen.queryByRole('tab', { name: 'Moderación' })).toBeNull();
  });

  it('el administrador ve los reportes marcados como pendientes (CA3) y los aprueba (CA1)', async () => {
    jest.mocked(reviewSighting).mockResolvedValue({ ...PENDING, status: 'approved' });
    await renderAs('admin', <CommunityScreen />);

    await fireEvent.press(screen.getByRole('tab', { name: 'Moderación' }));
    expect(await screen.findByText(/Pendiente de revisión/)).toBeTruthy();
    expect(screen.getByText('Especie sin identificar')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Aprobar' }));
    await waitFor(() => expect(reviewSighting).toHaveBeenCalledWith('r-2', 'approve'));
  });

  it('pide confirmación antes de rechazar (CA2)', async () => {
    jest.mocked(reviewSighting).mockResolvedValue({ ...PENDING, status: 'rejected' });
    await renderAs('superadmin', <CommunityScreen />);

    await fireEvent.press(screen.getByRole('tab', { name: 'Moderación' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Rechazar' }));
    expect(reviewSighting).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Sí, rechazar' }));
    await waitFor(() => expect(reviewSighting).toHaveBeenCalledWith('r-2', 'reject'));
  });

  it('muestra el mensaje del servidor si el reporte ya fue revisado', async () => {
    const { ApiError } = jest.requireActual('@/lib/api');
    jest.mocked(reviewSighting).mockRejectedValue(
      new ApiError({
        status: 409,
        kind: 'http',
        path: '/api/reportes-avistamiento/r-2/aprobar',
        serverMessage: 'El reporte ya fue revisado.',
      }),
    );
    await renderAs('admin', <CommunityScreen />);

    await fireEvent.press(screen.getByRole('tab', { name: 'Moderación' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Aprobar' }));
    expect(await screen.findByText('El reporte ya fue revisado.')).toBeTruthy();
  });
});

describe('NewSightingScreen (HU-18)', () => {
  it('muestra "La descripción es obligatoria." si falta la descripción (CA2)', async () => {
    await renderAs('user', <NewSightingScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar reporte' }));

    expect(await screen.findByText('La descripción es obligatoria.')).toBeTruthy();
    expect(createSighting).not.toHaveBeenCalled();
  });

  it('envía el reporte con reino y clasificación "Desconocido" y confirma el envío (CA1, CA3)', async () => {
    jest.mocked(createSighting).mockResolvedValue(PENDING);
    await renderAs('user', <NewSightingScreen />);

    await fireEvent.changeText(
      screen.getByLabelText('Lo que observaste'),
      'Escuché un canto extraño',
    );
    await fireEvent.press(screen.getByRole('radio', { name: 'Desconocido' }));
    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'No sé qué especie es (Desconocido)' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar reporte' }));

    await waitFor(() =>
      expect(createSighting).toHaveBeenCalledWith({
        remarks: 'Escuché un canto extraño',
        kingdom: 'unknown',
        vernacularName: '',
        location: null,
        photo: null,
      }),
    );
    expect(
      await screen.findByText('Tu reporte fue enviado y será revisado por un administrador.'),
    ).toBeTruthy();
  });

  it('no pide el autor: lo asigna el servidor con la sesión (CA4)', async () => {
    await renderAs('user', <NewSightingScreen />);
    expect(screen.queryByLabelText(/autor/i)).toBeNull();
  });

  it('muestra el mensaje del servidor si el envío falla', async () => {
    const { ApiError } = jest.requireActual('@/lib/api');
    jest.mocked(createSighting).mockRejectedValue(
      new ApiError({
        status: 413,
        kind: 'http',
        path: '/api/reportes-avistamiento',
        serverMessage: 'La imagen supera el tamaño máximo permitido de 10 MB.',
      }),
    );
    await renderAs('user', <NewSightingScreen />);

    await fireEvent.changeText(screen.getByLabelText('Lo que observaste'), 'Vi una garza');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar reporte' }));
    expect(
      await screen.findByText('La imagen supera el tamaño máximo permitido de 10 MB.'),
    ).toBeTruthy();
  });
});
