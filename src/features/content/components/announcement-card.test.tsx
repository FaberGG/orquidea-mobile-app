import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { CONTENT_LABELS } from '../constants';
import { type AdminAnnouncement, type Announcement } from '../types';
import { AnnouncementCard } from './announcement-card';

const NOW = new Date('2026-11-14T12:00:00Z');

const ANNOUNCEMENT: Announcement = {
  id: 'a-1',
  title: 'Jornada de aves',
  description: 'Observación guiada en el humedal',
  publishedAt: '2026-11-04T12:00:00Z',
  expiresAt: '2026-12-31T23:00:00Z',
  priority: 'high',
};

describe('AnnouncementCard', () => {
  it('muestra la prioridad en la franja, la fecha relativa, el título, la descripción y la vigencia', async () => {
    await render(<AnnouncementCard announcement={ANNOUNCEMENT} now={NOW} />);

    expect(screen.getByText('IMPORTANTE')).toBeTruthy();
    expect(screen.getByText('hace 10 días')).toBeTruthy();
    expect(screen.getByText('Jornada de aves')).toBeTruthy();
    expect(screen.getByText('Observación guiada en el humedal')).toBeTruthy();
    expect(screen.getByText('Vence el 31 dic 2026')).toBeTruthy();
  });

  it.each([
    ['medium', 'AVISO'],
    ['low', 'INFORMATIVO'],
  ] as const)('la prioridad %s se comunica con texto: %s', async (priority, label) => {
    await render(<AnnouncementCard announcement={{ ...ANNOUNCEMENT, priority }} now={NOW} />);

    expect(screen.getByText(label)).toBeTruthy();
  });

  it('no añade vigencia cuando el anuncio no tiene fecha de finalización', async () => {
    await render(
      <AnnouncementCard announcement={{ ...ANNOUNCEMENT, expiresAt: null }} now={NOW} />,
    );

    expect(screen.queryByText(/Vence/)).toBeNull();
  });

  it('sin estado no marca Visible/Oculto/Expirado (visitantes y usuarios)', async () => {
    await render(<AnnouncementCard announcement={ANNOUNCEMENT} now={NOW} />);

    expect(screen.queryByLabelText(/^Estado:/)).toBeNull();
  });

  it('un anuncio expirado lleva "· Expirado" en la franja y la fecha en que expiró', async () => {
    const expired: AdminAnnouncement = {
      ...ANNOUNCEMENT,
      expiresAt: '2026-09-30T15:00:00Z',
      visibility: 'expired',
    };
    await render(<AnnouncementCard announcement={expired} now={NOW} />);

    expect(screen.getByText('IMPORTANTE · EXPIRADO')).toBeTruthy();
    expect(screen.getByText('Expirado el 30 sep 2026')).toBeTruthy();
    expect(screen.getByLabelText(CONTENT_LABELS.visibilityState('Expirado'))).toBeTruthy();
  });

  it('muestra las acciones cuando se gestiona el anuncio', async () => {
    await render(
      <AnnouncementCard announcement={{ ...ANNOUNCEMENT, visibility: 'hidden' }} now={NOW}>
        <Text>Acciones</Text>
      </AnnouncementCard>,
    );

    expect(screen.getByLabelText(CONTENT_LABELS.visibilityState('Oculto'))).toBeTruthy();
    expect(screen.getByText('Acciones')).toBeTruthy();
  });
});
