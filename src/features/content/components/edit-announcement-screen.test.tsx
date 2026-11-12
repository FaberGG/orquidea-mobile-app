import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiError } from '@/lib/api';

import { listAdminAnnouncements, updateAnnouncement } from '../api';
import { CONTENT_LABELS, CONTENT_MESSAGES } from '../constants';
import { type AdminAnnouncement } from '../types';
import { EditAnnouncementScreen, getAnnouncementChanges } from './edit-announcement-screen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ id: 'a-1' }),
}));
jest.mock('../api', () => ({
  listAdminAnnouncements: jest.fn(),
  updateAnnouncement: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const ANNOUNCEMENT: AdminAnnouncement = {
  id: 'a-1',
  title: 'Jornada de aves',
  description: 'Sábado a las 7 a. m.',
  publishedAt: '2026-10-30T20:00:00Z',
  expiresAt: '2026-01-10T15:00:00Z',
  publisherName: null,
  priority: 'medium',
  visibility: 'expired',
};

let queryClient: QueryClient;

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>{children}</SafeAreaProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
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

describe('getAnnouncementChanges', () => {
  const values = {
    title: ANNOUNCEMENT.title,
    description: ANNOUNCEMENT.description,
    priority: ANNOUNCEMENT.priority,
    expiresAt: new Date(ANNOUNCEMENT.expiresAt as string),
  };

  it('sin cambios devuelve un objeto vacío (la fecha vencida no se reenvía)', () => {
    expect(getAnnouncementChanges(ANNOUNCEMENT, values)).toEqual({});
  });

  it('solo incluye lo que cambió', () => {
    const newDate = new Date('2026-12-24T23:00:00Z');
    expect(
      getAnnouncementChanges(ANNOUNCEMENT, { ...values, priority: 'high', expiresAt: newDate }),
    ).toEqual({ priority: 'high', expiresAt: newDate });
  });
});

describe('EditAnnouncementScreen (SCRUM-71)', () => {
  it('carga el anuncio y guarda solo la prioridad cambiada', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([ANNOUNCEMENT]);
    jest.mocked(updateAnnouncement).mockResolvedValue();
    await render(<EditAnnouncementScreen />, { wrapper: Providers });

    expect(await screen.findByDisplayValue('Jornada de aves')).toBeTruthy();
    await fireEvent.press(screen.getByText('Alta'));
    await fireEvent.press(screen.getByText(CONTENT_LABELS.saveButton));

    await waitFor(() =>
      expect(updateAnnouncement).toHaveBeenCalledWith('a-1', { priority: 'high' }),
    );
    expect(await screen.findByText(CONTENT_MESSAGES.announcementUpdated)).toBeTruthy();
  });

  it('no deja quitar una fecha de finalización ya puesta', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([ANNOUNCEMENT]);
    await render(<EditAnnouncementScreen />, { wrapper: Providers });

    expect(await screen.findByText(CONTENT_LABELS.expirationLockedHint)).toBeTruthy();
    expect(screen.queryByLabelText(CONTENT_LABELS.expirationClear)).toBeNull();
  });

  it('muestra el mensaje del servidor si la API rechaza el cambio', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([ANNOUNCEMENT]);
    jest.mocked(updateAnnouncement).mockRejectedValue(
      new ApiError({
        status: 400,
        kind: 'http',
        path: '/api/anuncios/a-1/actualizar',
        serverMessage: 'La fecha de expiración debe ser posterior a la fecha actual.',
      }),
    );
    await render(<EditAnnouncementScreen />, { wrapper: Providers });

    await fireEvent.press(await screen.findByText('Baja'));
    await fireEvent.press(screen.getByText(CONTENT_LABELS.saveButton));

    expect(
      await screen.findByText('La fecha de expiración debe ser posterior a la fecha actual.'),
    ).toBeTruthy();
  });

  it('avisa si el anuncio no existe', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([]);
    await render(<EditAnnouncementScreen />, { wrapper: Providers });

    expect(await screen.findByText(CONTENT_MESSAGES.announcementNotFound)).toBeTruthy();
  });
});
