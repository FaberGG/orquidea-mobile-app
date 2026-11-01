import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiError } from '@/lib/api';

import { hideAnnouncement, listAdminAnnouncements, showAnnouncement } from '../api';
import { CONTENT_LABELS, CONTENT_MESSAGES } from '../constants';
import { type AdminAnnouncement } from '../types';
import { ManageAnnouncementsScreen } from './manage-announcements-screen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('../api', () => ({
  listAdminAnnouncements: jest.fn(),
  hideAnnouncement: jest.fn(),
  showAnnouncement: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const VISIBLE: AdminAnnouncement = {
  id: 'a-1',
  title: 'Jornada de aves',
  description: 'Sábado a las 7 a. m.',
  publishedAt: '2026-10-30T20:00:00Z',
  priority: 'high',
  expiresAt: null,
  visibility: 'visible',
};
const HIDDEN: AdminAnnouncement = { ...VISIBLE, id: 'a-2', title: 'Taller', visibility: 'hidden' };
const EXPIRED: AdminAnnouncement = {
  ...VISIBLE,
  id: 'a-3',
  title: 'Feria pasada',
  expiresAt: '2026-10-01T15:00:00Z',
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

describe('ManageAnnouncementsScreen (HU-24)', () => {
  it('muestra todos los anuncios con su estado: Visible, Oculto y Expirado', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([VISIBLE, HIDDEN, EXPIRED]);
    await render(<ManageAnnouncementsScreen />, { wrapper: Providers });

    expect(await screen.findByText('Jornada de aves')).toBeTruthy();
    expect(screen.getByText(CONTENT_LABELS.visibilityVisible)).toBeTruthy();
    expect(screen.getByText(CONTENT_LABELS.visibilityHidden)).toBeTruthy();
    expect(screen.getByText(CONTENT_LABELS.visibilityExpired)).toBeTruthy();
    // El vencido no tiene acción: la API no permite mostrarlo.
    expect(screen.getAllByText(CONTENT_LABELS.hideButton)).toHaveLength(1);
    expect(screen.getAllByText(CONTENT_LABELS.showButton)).toHaveLength(1);
  });

  it('CA1: OCULTAR un anuncio visible lo retira y la lista se actualiza como Oculto', async () => {
    jest
      .mocked(listAdminAnnouncements)
      .mockResolvedValueOnce([VISIBLE])
      .mockResolvedValueOnce([{ ...VISIBLE, visibility: 'hidden' }]);
    jest.mocked(hideAnnouncement).mockResolvedValue(undefined);
    await render(<ManageAnnouncementsScreen />, { wrapper: Providers });

    await fireEvent.press(await screen.findByText(CONTENT_LABELS.hideButton));

    expect(hideAnnouncement).toHaveBeenCalledWith('a-1');
    expect(await screen.findByText(CONTENT_LABELS.visibilityHidden)).toBeTruthy();
    expect(screen.getByText(CONTENT_LABELS.showButton)).toBeTruthy();
  });

  it('CA2: MOSTRAR un anuncio oculto lo vuelve a publicar', async () => {
    jest
      .mocked(listAdminAnnouncements)
      .mockResolvedValueOnce([HIDDEN])
      .mockResolvedValueOnce([{ ...HIDDEN, visibility: 'visible' }]);
    jest.mocked(showAnnouncement).mockResolvedValue(undefined);
    await render(<ManageAnnouncementsScreen />, { wrapper: Providers });

    await fireEvent.press(await screen.findByText(CONTENT_LABELS.showButton));

    expect(showAnnouncement).toHaveBeenCalledWith('a-2');
    expect(await screen.findByText(CONTENT_LABELS.visibilityVisible)).toBeTruthy();
  });

  it('si la API rechaza mostrar un anuncio vencido, muestra su mensaje', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([HIDDEN]);
    jest.mocked(showAnnouncement).mockRejectedValue(
      new ApiError({
        status: 409,
        kind: 'http',
        path: '/api/anuncios/a-2/mostrar',
        serverMessage: 'No puedes mostrar un anuncio que ya expiró.',
      }),
    );
    await render(<ManageAnnouncementsScreen />, { wrapper: Providers });

    await fireEvent.press(await screen.findByText(CONTENT_LABELS.showButton));

    await waitFor(() =>
      expect(screen.getByText('No puedes mostrar un anuncio que ya expiró.')).toBeTruthy(),
    );
  });

  it('sin anuncios muestra el estado vacío', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([]);
    await render(<ManageAnnouncementsScreen />, { wrapper: Providers });

    expect(await screen.findByText(CONTENT_MESSAGES.announcementsAdminEmpty)).toBeTruthy();
  });
});
