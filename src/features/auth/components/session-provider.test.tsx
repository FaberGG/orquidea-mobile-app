import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import { registerOfflineQueries } from '@/lib/offline';
import { getToken } from '@/lib/storage';

import { getMe } from '../api';
import { authKeys } from '../constants';
import { useSession } from '../hooks';
import { type User } from '../types';
import { SessionProvider } from './session-provider';

jest.mock('@/lib/storage', () => ({
  getToken: jest.fn(),
  saveToken: jest.fn(),
  clearToken: jest.fn(),
}));
jest.mock('../api', () => ({ getMe: jest.fn() }));

const ADMIN: User = {
  id: '1',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@orquidea.local',
  role: 'admin',
};

let signOut: () => Promise<void>;

function Probe() {
  const session = useSession();
  useEffect(() => {
    signOut = session.signOut;
  }, [session.signOut]);
  return null;
}

describe('SessionProvider y datos offline (HU-21)', () => {
  it('al cerrar sesión borra los datos de la cuenta pero conserva los guardados para uso offline', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    registerOfflineQueries(queryClient, ['species']);
    jest.mocked(getToken).mockResolvedValue({ token: 'jwt', expiresAt: Date.now() + 60_000 });
    jest.mocked(getMe).mockResolvedValue(ADMIN);

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <SessionProvider>{children}</SessionProvider>
        </QueryClientProvider>
      );
    }
    await render(<Probe />, { wrapper: Wrapper });
    await waitFor(() => expect(queryClient.getQueryData(authKeys.me())).toEqual(ADMIN));

    queryClient.setQueryData(['species', 'list', 'all'], [{ id: 'ave-1' }]);
    queryClient.setQueryData(['admins', 'list'], [{ id: 'a' }]);

    await act(() => signOut());

    expect(queryClient.getQueryData(['species', 'list', 'all'])).toEqual([{ id: 'ave-1' }]);
    expect(queryClient.getQueryData(['admins', 'list'])).toBeUndefined();
    expect(queryClient.getQueryData(authKeys.me())).toBeNull();
    queryClient.clear();
  });
});
