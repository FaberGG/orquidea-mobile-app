import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { ApiError } from '@/lib/api';

import { createAnnouncement } from '../api';
import { CONTENT_LABELS, CONTENT_MESSAGES } from '../constants';
import { PublishAnnouncementScreen } from './publish-announcement-screen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('../api', () => ({ createAnnouncement: jest.fn() }));

let queryClient: QueryClient;

function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

async function fillAndPublish(title: string, description: string) {
  await fireEvent.changeText(screen.getByLabelText(CONTENT_LABELS.titleLabel), title);
  await fireEvent.changeText(screen.getByLabelText(CONTENT_LABELS.descriptionLabel), description);
  await fireEvent.press(screen.getByText(CONTENT_LABELS.publishButton));
}

describe('PublishAnnouncementScreen (HU-16)', () => {
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

  it('CA1: con título y contenido publica el anuncio, confirma y limpia el formulario', async () => {
    jest.mocked(createAnnouncement).mockResolvedValue(undefined);
    await render(<PublishAnnouncementScreen />, { wrapper: Providers });

    await fillAndPublish(' Jornada de aves ', 'Sábado a las 8 a. m.');

    expect(await screen.findByText(CONTENT_MESSAGES.announcementPublished)).toBeTruthy();
    expect(createAnnouncement).toHaveBeenCalledWith({
      title: 'Jornada de aves',
      description: 'Sábado a las 8 a. m.',
    });
    expect(screen.getByLabelText(CONTENT_LABELS.titleLabel).props.value).toBe('');
    expect(screen.getByLabelText(CONTENT_LABELS.descriptionLabel).props.value).toBe('');
  });

  it.each([
    ['falta el título', '', 'Contenido'],
    ['falta el contenido', 'Título', ''],
    ['faltan ambos', '', ''],
  ])(
    'CA2: si %s muestra "Debes completar el título y el contenido del anuncio." sin publicar',
    async (_c, title, description) => {
      await render(<PublishAnnouncementScreen />, { wrapper: Providers });

      await fillAndPublish(title, description);

      expect(await screen.findByText(CONTENT_MESSAGES.announcementRequiredFields)).toBeTruthy();
      expect(screen.getAllByText(CONTENT_MESSAGES.announcementRequiredFields)).toHaveLength(1);
      expect(createAnnouncement).not.toHaveBeenCalled();
    },
  );

  it('si la API rechaza la publicación muestra su mensaje y conserva lo escrito', async () => {
    jest
      .mocked(createAnnouncement)
      .mockRejectedValue(new ApiError({ status: 403, kind: 'http', path: '/api/anuncios' }));
    await render(<PublishAnnouncementScreen />, { wrapper: Providers });

    await fillAndPublish('Jornada', 'Texto');

    expect(await screen.findByText(CONTENT_MESSAGES.forbidden)).toBeTruthy();
    expect(screen.getByLabelText(CONTENT_LABELS.titleLabel).props.value).toBe('Jornada');
    await waitFor(() =>
      expect(screen.queryByText(CONTENT_MESSAGES.announcementPublished)).toBeNull(),
    );
  });
});
