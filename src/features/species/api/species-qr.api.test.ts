import { apiClient } from '@/lib/api';

import { getSpeciesQr } from './species.api';

jest.mock('@/lib/api', () => ({ apiClient: { getBinary: jest.fn() } }));

describe('getSpeciesQr', () => {
  beforeEach(() => jest.clearAllMocks());

  it('solicita el PNG de la ficha con cancelación y valida su firma binaria', async () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 1]);
    jest.mocked(apiClient.getBinary).mockResolvedValue(bytes.buffer);
    const controller = new AbortController();

    await expect(getSpeciesQr('ficha/1', controller.signal)).resolves.toEqual(bytes);
    expect(apiClient.getBinary).toHaveBeenCalledWith('/api/fichas-taxonomicas/ficha%2F1/qr', {
      accept: 'image/png, application/json',
      signal: controller.signal,
    });
  });

  it.each([{ bytes: [] }, { bytes: [60, 104, 116, 109, 108] }, { bytes: [137, 80, 78, 71] }])(
    'rechaza una respuesta que no contiene la firma PNG completa: %j',
    async ({ bytes }) => {
      jest.mocked(apiClient.getBinary).mockResolvedValue(new Uint8Array(bytes).buffer);
      await expect(getSpeciesQr('ficha-1')).rejects.toThrow('no es una imagen PNG');
    },
  );
});
