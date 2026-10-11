import { apiClient, uploadMultipart } from '@/lib/api';

import { type WetlandComponentChanges } from '../types';
import {
  getWetlandComponent,
  listWetlandComponents,
  saveWetlandComponentChanges,
} from './wetland-components.api';

jest.mock('@/lib/api', () => ({
  apiClient: { get: jest.fn(), put: jest.fn(), delete: jest.fn() },
  uploadMultipart: jest.fn(),
}));

const AVES_DTO = {
  tipo: 'AVES',
  nombre: 'Aves',
  descripcion: 'Especies residentes y migratorias',
  tieneContenido: true,
  fotos: [{ id: 'f1', url: 'http://localhost:9000/orquidea/componentes/f1.jpg' }],
  fechaActualizacion: '2026-10-09T15:30:00.123456Z',
};

const PHOTO = { uri: 'file:///garza.jpg', mimeType: 'image/jpeg', fileName: 'garza.jpg' } as const;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiClient.get).mockResolvedValue(AVES_DTO);
});

describe('consulta de componentes (HU-14)', () => {
  it('lista los componentes sin token', async () => {
    jest.mocked(apiClient.get).mockResolvedValue([AVES_DTO]);
    const components = await listWetlandComponents();
    expect(apiClient.get).toHaveBeenCalledWith('/api/componentes', { authenticated: false });
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe('AVES');
  });

  it('pide un componente por su tipo', async () => {
    await getWetlandComponent('AVES');
    expect(apiClient.get).toHaveBeenCalledWith('/api/componentes/AVES', { authenticated: false });
  });

  it('rechaza una respuesta que no cumple el contrato', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({ tipo: 'AVES' });
    await expect(getWetlandComponent('AVES')).rejects.toThrow();
  });
});

describe('saveWetlandComponentChanges (HU-15)', () => {
  const changes: WetlandComponentChanges = {
    name: ' Aves ',
    description: ' Nueva descripción ',
    removedPhotoIds: ['f1'],
    newPhotos: [PHOTO],
  };

  it('guarda el texto, borra, sube y vuelve a leer, en ese orden', async () => {
    const calls: string[] = [];
    jest.mocked(apiClient.put).mockImplementation(async () => calls.push('put'));
    jest.mocked(apiClient.delete).mockImplementation(async () => calls.push('delete'));
    jest.mocked(uploadMultipart).mockImplementation(async () => calls.push('upload'));
    jest.mocked(apiClient.get).mockImplementation(async () => {
      calls.push('get');
      return AVES_DTO;
    });

    const result = await saveWetlandComponentChanges('AVES', changes);

    expect(calls).toEqual(['put', 'delete', 'upload', 'get']);
    expect(apiClient.put).toHaveBeenCalledWith('/api/componentes/AVES', {
      body: { nombre: 'Aves', descripcion: 'Nueva descripción' },
    });
    expect(apiClient.delete).toHaveBeenCalledWith('/api/componentes/AVES/fotos/f1');
    expect(uploadMultipart).toHaveBeenCalledWith(
      'POST',
      '/api/componentes/AVES/fotos',
      {},
      { uri: 'file:///garza.jpg', mimeType: 'image/jpeg' },
      'foto',
    );
    expect(result.name).toBe('Aves');
  });

  it('avisa qué fotos ya quedaron subidas y se detiene en el primer fallo', async () => {
    const second = { ...PHOTO, uri: 'file:///pato.png', mimeType: 'image/png' as const };
    const failure = new Error('409');
    jest.mocked(uploadMultipart).mockResolvedValueOnce(undefined).mockRejectedValueOnce(failure);
    const onPhotoAdded = jest.fn();

    await expect(
      saveWetlandComponentChanges(
        'AVES',
        { ...changes, removedPhotoIds: [], newPhotos: [PHOTO, second] },
        { onPhotoAdded },
      ),
    ).rejects.toBe(failure);

    expect(onPhotoAdded).toHaveBeenCalledTimes(1);
    expect(onPhotoAdded).toHaveBeenCalledWith(PHOTO);
    expect(apiClient.get).not.toHaveBeenCalled();
  });
});
