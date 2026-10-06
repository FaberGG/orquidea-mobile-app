import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useSession } from '@/features/auth';

import { ADMIN_LABELS, ADMIN_MESSAGES } from '../constants';
import { useAdmin, useRevokeAdmin, useUpdateAdmin } from '../hooks';
import { EditAdminScreen } from './edit-admin-screen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'admin-1' }),
}));
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('../hooks', () => ({
  useAdmin: jest.fn(),
  useRevokeAdmin: jest.fn(),
  useUpdateAdmin: jest.fn(),
}));

const account = {
  id: 'admin-1',
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@orquidea.co',
  role: 'admin' as const,
  isEnabled: true,
};
const mutateUpdate = jest.fn();
const mutateRevoke = jest.fn();
const resetRevoke = jest.fn();
const applyConfirmedRole = jest.fn();

describe('EditAdminScreen (HU-5)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({
      user: { id: 'super-1', role: 'superadmin' },
      applyConfirmedRole,
    } as unknown as ReturnType<typeof useSession>);
    jest.mocked(useAdmin).mockReturnValue({
      data: account,
      isPending: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAdmin>);
    jest.mocked(useUpdateAdmin).mockReturnValue({
      mutateAsync: mutateUpdate,
      isPending: false,
      isError: false,
      reset: jest.fn(),
    } as unknown as ReturnType<typeof useUpdateAdmin>);
    jest.mocked(useRevokeAdmin).mockReturnValue({
      mutateAsync: mutateRevoke,
      isPending: false,
      isError: false,
      reset: resetRevoke,
    } as unknown as ReturnType<typeof useRevokeAdmin>);
  });

  it('guarda los datos editados y confirma el resultado de la API', async () => {
    mutateUpdate.mockResolvedValue({ ...account, firstName: 'Ana María' });
    await render(<EditAdminScreen />);
    await fireEvent.changeText(screen.getByLabelText(ADMIN_LABELS.firstName), 'Ana María');
    await fireEvent.press(screen.getByText(ADMIN_LABELS.save));

    await waitFor(() =>
      expect(mutateUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Ana María',
          lastName: 'Pérez',
          email: 'ana@orquidea.co',
          isEnabled: true,
        }),
      ),
    );
    expect(await screen.findByText(ADMIN_MESSAGES.saved)).toBeTruthy();
  });

  it('permite cancelar la confirmación sin revocar la cuenta', async () => {
    await render(<EditAdminScreen />);
    await fireEvent.press(screen.getByText(ADMIN_LABELS.revoke));
    await fireEvent.press(screen.getByText(ADMIN_LABELS.cancel));

    expect(screen.queryByText(ADMIN_LABELS.revokeQuestion)).toBeNull();
    expect(mutateRevoke).not.toHaveBeenCalled();
  });

  it('al revocarse, actualiza el rol y conserva la sesión como usuario registrado', async () => {
    jest.mocked(useSession).mockReturnValue({
      user: { id: account.id, role: 'superadmin' },
      applyConfirmedRole,
    } as unknown as ReturnType<typeof useSession>);
    jest.mocked(useAdmin).mockReturnValue({
      data: { ...account, role: 'superadmin' },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAdmin>);
    mutateRevoke.mockResolvedValue(account.id);
    await render(<EditAdminScreen />);

    await fireEvent.press(screen.getByText(ADMIN_LABELS.revoke));
    await fireEvent.press(screen.getAllByText(ADMIN_LABELS.revoke)[1]);

    await waitFor(() => expect(applyConfirmedRole).toHaveBeenCalledWith('user'));
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('impide abrir revocación mientras se guarda la edición', async () => {
    jest.mocked(useUpdateAdmin).mockReturnValue({
      mutateAsync: mutateUpdate,
      isPending: true,
      isError: false,
      reset: jest.fn(),
    } as unknown as ReturnType<typeof useUpdateAdmin>);
    await render(<EditAdminScreen />);

    await fireEvent.press(screen.getByText(ADMIN_LABELS.revoke));

    expect(screen.queryByText(ADMIN_LABELS.revokeQuestion)).toBeNull();
  });
});
