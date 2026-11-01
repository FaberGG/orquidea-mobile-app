import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { RoleProvider, type Role } from '@/permissions';

import { CONTENT_LABELS } from '../constants';
import { CreateAnnouncementButton } from './create-announcement-button';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

async function renderAs(role: Role) {
  await render(
    <RoleProvider role={role}>
      <CreateAnnouncementButton />
    </RoleProvider>,
  );
}

describe('CreateAnnouncementButton (Acta 17)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('el administrador abre el formulario de nuevo anuncio desde la lista', async () => {
    await renderAs('admin');
    await fireEvent.press(screen.getByLabelText(CONTENT_LABELS.publishTitle));
    expect(router.push).toHaveBeenCalledWith('/announcements/new');
  });

  it.each<Role>(['visitor', 'user'])('%s no ve la opción', async (role) => {
    await renderAs(role);
    expect(screen.queryByLabelText(CONTENT_LABELS.publishTitle)).toBeNull();
  });
});
