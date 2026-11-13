import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { CONTENT_LABELS } from '../constants';
import { type Announcement } from '../types';
import { AnnouncementCard } from './announcement-card';

const ANNOUNCEMENT: Announcement = {
  id: 'a-1',
  title: 'Jornada de aves',
  description: 'Observación guiada en el humedal',
  publishedAt: '2026-11-04T12:00:00Z',
  expiresAt: '2026-11-12T23:00:00Z',
  publisherName: null,
  priority: 'high',
};

describe('AnnouncementCard', () => {
  it('muestra la fecha y hora de finalización del anuncio', async () => {
    await render(<AnnouncementCard announcement={ANNOUNCEMENT} />);

    expect(screen.getByText(/Disponible hasta el 12 de noviembre de 2026, 6:00/)).toBeTruthy();
  });

  it('no añade vigencia cuando el anuncio no tiene fecha de finalización', async () => {
    await render(<AnnouncementCard announcement={{ ...ANNOUNCEMENT, expiresAt: null }} />);

    expect(screen.getByText(/Publicado el 4 de noviembre de 2026/)).toBeTruthy();
    expect(screen.queryByText(/Disponible hasta el/)).toBeNull();
  });

  it('muestra el publicador junto a la fecha solo cuando la API lo proporciona', async () => {
    await render(
      <AnnouncementCard announcement={{ ...ANNOUNCEMENT, publisherName: 'Ana Gómez' }} />,
    );

    expect(screen.getByText('Publicado el 4 de noviembre de 2026 · por Ana Gómez')).toBeTruthy();
  });

  it('SCRUM-71: sin estado no muestra Visible/Oculto/Expirado (visitantes y usuarios)', async () => {
    await render(<AnnouncementCard announcement={ANNOUNCEMENT} />);
    expect(screen.queryByText(CONTENT_LABELS.visibilityVisible)).toBeNull();
  });

  it('SCRUM-71: muestra el estado y las acciones cuando se gestiona el anuncio', async () => {
    await render(
      <AnnouncementCard announcement={{ ...ANNOUNCEMENT, visibility: 'hidden' }}>
        <Text>Acciones</Text>
      </AnnouncementCard>,
    );
    expect(screen.getByText(CONTENT_LABELS.visibilityHidden)).toBeTruthy();
    expect(screen.getByText('Acciones')).toBeTruthy();
  });
});
