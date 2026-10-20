import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { getSpecies } from '../api';
import { speciesKeys } from '../constants';
import { type Species } from '../types';
import { useQrResolution } from './use-qr-resolution';

jest.mock('../api', () => ({ getSpecies: jest.fn() }));

const SPECIES: Species = {
  id: '8a48268f-50f0-44f2-a86d-882b4e3ea101',
  category: 'bird',
  order: 'Passeriformes',
  family: 'Thraupidae',
  genus: 'Thraupis',
  scientificName: 'Thraupis episcopus',
  vernacularName: 'Azulejo',
  diet: 'Frutos',
  wetlandRole: 'Dispersor',
  conservationStatus: 'LC',
  photoUrl: null,
};

describe('useQrResolution', () => {
  let queryClient: QueryClient;

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  afterEach(() => queryClient.clear());

  it('hace una verificación fresca por intento y solo entonces actualiza el detalle compartido', async () => {
    jest.mocked(getSpecies).mockResolvedValue(SPECIES);
    const { result } = await renderHook(() => useQrResolution(), { wrapper: Wrapper });

    await result.current.resolve(SPECIES.id);

    expect(getSpecies).toHaveBeenCalledWith(
      SPECIES.id,
      expect.objectContaining({ timeoutMs: 10_000, signal: expect.anything() }),
    );
    expect(queryClient.getQueryData(speciesKeys.detail(SPECIES.id))).toEqual(SPECIES);

    await result.current.resolve(SPECIES.id);
    expect(getSpecies).toHaveBeenCalledTimes(2);
  });

  it('no publica en la caché normal una respuesta cuyo UUID no coincide', async () => {
    jest.mocked(getSpecies).mockResolvedValue({ ...SPECIES, id: 'otra-ficha' });
    const { result } = await renderHook(() => useQrResolution(), { wrapper: Wrapper });

    await expect(result.current.resolve(SPECIES.id)).rejects.toThrow(
      'La ficha recibida no coincide con el código QR.',
    );
    expect(queryClient.getQueryData(speciesKeys.detail(SPECIES.id))).toBeUndefined();
  });

  it('cancela solo la consulta QR activa al salir', async () => {
    let requestSignal: AbortSignal | undefined;
    jest.mocked(getSpecies).mockImplementation(
      (_id, options) =>
        new Promise((_resolve, reject) => {
          requestSignal = options?.signal;
          options?.signal?.addEventListener('abort', () => reject(new Error('cancelled')));
        }),
    );
    const { result } = await renderHook(() => useQrResolution(), { wrapper: Wrapper });
    let pending!: Promise<unknown>;

    pending = result.current.resolve(SPECIES.id);
    await waitFor(() => expect(requestSignal).toBeDefined());

    await result.current.cancel();
    await expect(pending).rejects.toThrow();
    await waitFor(() => expect(requestSignal?.aborted).toBe(true));
    expect(queryClient.getQueryData(speciesKeys.detail(SPECIES.id))).toBeUndefined();
  });
});
