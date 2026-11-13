import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiError } from '@/lib/api';
import { RoleProvider, type Role } from '@/permissions';

import {
  hideAnnouncement,
  listAdminAnnouncements,
  listAnnouncements,
  showAnnouncement,
} from '../api';
import { CONTENT_LABELS, CONTENT_MESSAGES } from '../constants';
import { type AdminAnnouncement, type Announcement } from '../types';
import { AnnouncementsListScreen } from './announcements-list-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('../api', () => ({
  listAnnouncements: jest.fn(),
  listAdminAnnouncements: jest.fn(),
  hideAnnouncement: jest.fn(),
  showAnnouncement: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const PUBLIC: Announcement = {
  id: 'a-1',
  title: 'Jornada de aves',
  description: 'Sábado a las 7 a. m.',
  publishedAt: '2026-10-30T20:00:00Z',
  expiresAt: null,
  publisherName: null,
  priority: 'high',
};
const VISIBLE: AdminAnnouncement = { ...PUBLIC, visibility: 'visible' };
const HIDDEN: AdminAnnouncement = { ...PUBLIC, id: 'a-2', title: 'Taller', visibility: 'hidden' };
const EXPIRED: AdminAnnouncement = {
  ...PUBLIC,
  id: 'a-3',
  title: 'Feria pasada',
  expiresAt: '2026-10-01T15:00:00Z',
  visibility: 'expired',
};

let queryClient: QueryClient;

async function renderAs(role: Role) {
  await render(
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <RoleProvider role={role}>
          <AnnouncementsListScreen />
        </RoleProvider>
      </SafeAreaProvider>
    </QueryClientProvider>,
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

describe('AnnouncementsListScreen unificada (HU-17 + SCRUM-71)', () => {
  it.each<Role>(['visitor', 'user'])(
    '%s ve solo la lista pública, sin estado ni acciones',
    async (role) => {
      jest.mocked(listAnnouncements).mockResolvedValue([PUBLIC]);
      await renderAs(role);

      expect(await screen.findByText('Jornada de aves')).toBeTruthy();
      expect(listAdminAnnouncements).not.toHaveBeenCalled();
      expect(screen.queryByText(CONTENT_LABELS.visibilityVisible)).toBeNull();
      expect(screen.queryByText(CONTENT_LABELS.hideButton)).toBeNull();
      expect(screen.queryByText(CONTENT_LABELS.editButton)).toBeNull();
    },
  );

  it.each<Role>(['admin', 'superadmin'])(
    '%s ve todos los anuncios con su estado y las acciones de gestión',
    async (role) => {
      jest.mocked(listAdminAnnouncements).mockResolvedValue([VISIBLE, HIDDEN, EXPIRED]);
      await renderAs(role);

      expect(await screen.findByText('Feria pasada')).toBeTruthy();
      expect(listAnnouncements).not.toHaveBeenCalled();
      expect(screen.getByText(CONTENT_LABELS.visibilityVisible)).toBeTruthy();
      expect(screen.getByText(CONTENT_LABELS.visibilityHidden)).toBeTruthy();
      expect(screen.getByText(CONTENT_LABELS.visibilityExpired)).toBeTruthy();
      // Todos se pueden editar; el vencido no se puede mostrar (la API responde 409).
      expect(screen.getAllByText(CONTENT_LABELS.editButton)).toHaveLength(3);
      expect(screen.getAllByText(CONTENT_LABELS.hideButton)).toHaveLength(1);
      expect(screen.getAllByText(CONTENT_LABELS.showButton)).toHaveLength(1);
    },
  );

  it('HU-24 CA1: OCULTAR llama a la API y refresca la lista', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([VISIBLE]);
    jest.mocked(hideAnnouncement).mockResolvedValue();
    await renderAs('admin');

    await fireEvent.press(await screen.findByText(CONTENT_LABELS.hideButton));

    await waitFor(() => expect(hideAnnouncement).toHaveBeenCalledWith('a-1'));
    await waitFor(() => expect(listAdminAnnouncements).toHaveBeenCalledTimes(2));
  });

  it('HU-24 CA2: MOSTRAR un anuncio oculto', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([HIDDEN]);
    jest.mocked(showAnnouncement).mockResolvedValue();
    await renderAs('admin');

    await fireEvent.press(await screen.findByText(CONTENT_LABELS.showButton));

    await waitFor(() => expect(showAnnouncement).toHaveBeenCalledWith('a-2'));
  });

  it('muestra el mensaje del servidor si no se puede mostrar', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([HIDDEN]);
    jest.mocked(showAnnouncement).mockRejectedValue(
      new ApiError({
        status: 409,
        kind: 'http',
        path: '/api/anuncios/a-2/mostrar',
        serverMessage: CONTENT_MESSAGES.announcementExpiredCannotShow,
      }),
    );
    await renderAs('admin');

    await fireEvent.press(await screen.findByText(CONTENT_LABELS.showButton));

    expect(await screen.findByText(CONTENT_MESSAGES.announcementExpiredCannotShow)).toBeTruthy();
  });

  it('EDITAR abre la edición del anuncio', async () => {
    jest.mocked(listAdminAnnouncements).mockResolvedValue([VISIBLE]);
    await renderAs('admin');

    await fireEvent.press(await screen.findByText(CONTENT_LABELS.editButton));

    expect(router.push).toHaveBeenCalledWith('/announcements/a-1/edit');
  });

  it('HU-17 CA2: sin anuncios muestra el mensaje vacío', async () => {
    jest.mocked(listAnnouncements).mockResolvedValue([]);
    await renderAs('visitor');

    expect(await screen.findByText(CONTENT_MESSAGES.announcementsEmpty)).toBeTruthy();
  });
});
