import { QueryClient } from '@tanstack/react-query';

import { listStations } from '../api';
import { type Station } from '../types';
import { prefetchStationsForOffline } from './stations-offline';

jest.mock('../api', () => ({ listStations: jest.fn() }));

const MIRADOR: Station = {
  id: 'e-1',
  name: 'Mirador',
  description: '',
  photoUrl: 'https://r2.example/estaciones/e-1.jpg',
  thumbnailUrl: 'https://r2.example/estaciones/miniaturas/e-1.jpg',
  location: { latitude: 2.4598, longitude: -76.6115 },
  species: [
    {
      id: 'ave-1',
      vernacularName: 'Garza real',
      photoUrl: 'https://r2.example/fichas/ave-1.jpg',
      thumbnailUrl: 'https://r2.example/fichas/miniaturas/ave-1.jpg',
    },
    { id: 'ave-2', vernacularName: 'Pato', photoUrl: null, thumbnailUrl: null },
  ],
};

describe('prefetchStationsForOffline (HU-21)', () => {
  it('devuelve la foto y la miniatura de cada estación y las miniaturas de sus fichas', async () => {
    jest.mocked(listStations).mockResolvedValue([MIRADOR]);
    const queryClient = new QueryClient();

    const urls = await prefetchStationsForOffline(queryClient);

    expect(urls).toEqual([
      'https://r2.example/estaciones/e-1.jpg',
      'https://r2.example/estaciones/miniaturas/e-1.jpg',
      'https://r2.example/fichas/miniaturas/ave-1.jpg',
    ]);
    queryClient.clear();
  });
});
