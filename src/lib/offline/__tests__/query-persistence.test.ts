import { QueryClient } from '@tanstack/react-query';

import { isPersistedQuery, registerOfflineQueries, shouldPersistQuery } from '../query-persistence';

describe('persistencia de la caché (ADR-0017)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  afterEach(() => queryClient.clear());

  it('marca como offline las queries registradas, incluidas las creadas con setQueryData', () => {
    registerOfflineQueries(queryClient, ['species']);
    queryClient.setQueryData(['species', 'detail', '1'], { id: '1' });
    queryClient.setQueryData(['admins', 'list'], []);

    const species = queryClient.getQueryCache().find({ queryKey: ['species', 'detail', '1'] });
    const admins = queryClient.getQueryCache().find({ queryKey: ['admins', 'list'] });

    expect(species && isPersistedQuery(species)).toBe(true);
    expect(species?.options.gcTime).toBe(Infinity);
    expect(admins && isPersistedQuery(admins)).toBe(false);
  });

  it('solo persiste queries marcadas y con datos válidos', async () => {
    registerOfflineQueries(queryClient, ['species']);
    queryClient.setQueryData(['species', 'list', 'all'], []);
    await queryClient
      .fetchQuery({
        queryKey: ['species', 'detail', 'x'],
        queryFn: () => Promise.reject(new Error('sin red')),
        retry: false,
      })
      .catch(() => undefined);
    queryClient.setQueryData(['admins', 'list'], []);

    const persists = (queryKey: string[]) => {
      const query = queryClient.getQueryCache().find({ queryKey });
      return query !== undefined && shouldPersistQuery(query);
    };
    expect(persists(['species', 'list', 'all'])).toBe(true);
    expect(persists(['species', 'detail', 'x'])).toBe(false);
    expect(persists(['admins', 'list'])).toBe(false);
  });
});
