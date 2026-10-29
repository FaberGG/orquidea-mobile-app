import { apiClient, uploadMultipart } from '@/lib/api';

import { type SpeciesInput } from '../types';
import { createSpecies, updateSpecies } from './species.api';

jest.mock('@/lib/api', () => ({
  apiClient: { get: jest.fn(), put: jest.fn(), delete: jest.fn() },
  uploadMultipart: jest.fn(),
}));

const ID = '5b0c7f0e-2f5d-4a8e-9a57-0c7d3c1b6e21';

const dto = (fotos: { id: string; url: string }[]) => ({
  id: ID,
  categoria: 'AVE',
  order: 'Passeriformes',
  family: 'Thraupidae',
  genus: 'Thraupis',
  scientificName: 'Thraupis episcopus',
  vernacularName: 'Azulejo',
  alimentacion: 'Frutos',
  rolEnHumedal: 'Dispersor',
  estadoConservacion: 'LC',
  urlFoto: fotos[0]?.url ?? null,
  fotos,
});

const photo = (name: string) =>
  ({
    uri: `file:///${name}.jpg`,
    fileName: `${name}.jpg`,
    mimeType: 'image/jpeg',
    fileSize: 1000,
  }) as const;

const INPUT: SpeciesInput = {
  category: 'bird',
  vernacularName: 'Azulejo',
  scientificName: 'Thraupis episcopus',
  order: 'Passeriformes',
  family: 'Thraupidae',
  genus: 'Thraupis',
  diet: 'Frutos',
  wetlandRole: 'Dispersor',
  conservationStatus: 'LC',
  newPhotos: [],
  removedPhotoIds: [],
};

const F1 = { id: 'f1', url: 'http://localhost:9000/f1.jpg' };
const F2 = { id: 'f2', url: 'http://localhost:9000/f2.jpg' };
const F3 = { id: 'f3', url: 'http://localhost:9000/f3.jpg' };

beforeEach(() => jest.clearAllMocks());

describe('createSpecies (HU-7 v2.0, contrato inferido SCRUM-47)', () => {
  it('crea con la primera foto en `fotos` y agrega el resto en orden con `foto`', async () => {
    jest
      .mocked(uploadMultipart)
      .mockResolvedValueOnce(dto([F1]))
      .mockResolvedValueOnce(dto([F1, F2]))
      .mockResolvedValueOnce(dto([F1, F2, F3]));

    const result = await createSpecies({
      ...INPUT,
      newPhotos: [photo('uno'), photo('dos'), photo('tres')],
    });

    const calls = jest.mocked(uploadMultipart).mock.calls;
    expect(calls[0]).toEqual([
      'POST',
      '/api/fichas-taxonomicas',
      expect.objectContaining({ categoria: 'AVE', scientificName: 'Thraupis episcopus' }),
      { uri: 'file:///uno.jpg', mimeType: 'image/jpeg' },
      'fotos',
    ]);
    expect(calls[1]).toEqual([
      'POST',
      `/api/fichas-taxonomicas/${ID}/fotos`,
      {},
      { uri: 'file:///dos.jpg', mimeType: 'image/jpeg' },
      'foto',
    ]);
    expect(calls[2][3]).toEqual({ uri: 'file:///tres.jpg', mimeType: 'image/jpeg' });
    expect(result.pendingPhotos).toEqual([]);
    expect(result.species.photos.map((item) => item.id)).toEqual(['f1', 'f2', 'f3']);
  });

  it('si falla una foto adicional, devuelve la ficha creada y las fotos pendientes', async () => {
    jest
      .mocked(uploadMultipart)
      .mockResolvedValueOnce(dto([F1]))
      .mockRejectedValueOnce(new Error('sin red'));

    const result = await createSpecies({
      ...INPUT,
      newPhotos: [photo('uno'), photo('dos'), photo('tres')],
    });

    expect(uploadMultipart).toHaveBeenCalledTimes(2);
    expect(result.species.id).toBe(ID);
    expect(result.pendingPhotos.map((item) => item.uri)).toEqual([
      'file:///dos.jpg',
      'file:///tres.jpg',
    ]);
  });

  it('lanza el error si falla la creación misma', async () => {
    jest.mocked(uploadMultipart).mockRejectedValueOnce(new Error('409'));
    await expect(createSpecies({ ...INPUT, newPhotos: [photo('uno')] })).rejects.toThrow('409');
  });
});

describe('updateSpecies (HU-8 v2.0)', () => {
  it('guarda el texto sin archivos, quita fotos, agrega las nuevas y relee la ficha', async () => {
    jest.mocked(apiClient.get).mockResolvedValue(dto([F2, F3]));
    jest.mocked(uploadMultipart).mockResolvedValue(dto([F2, F3]));
    const onPhotoRemoved = jest.fn();
    const onPhotoAdded = jest.fn();

    const species = await updateSpecies(
      ID,
      { ...INPUT, removedPhotoIds: ['f1'], newPhotos: [photo('tres')] },
      { onPhotoRemoved, onPhotoAdded },
    );

    expect(apiClient.put).toHaveBeenCalledWith(`/api/fichas-taxonomicas/${ID}`, {
      formData: expect.any(FormData),
    });
    expect(apiClient.delete).toHaveBeenCalledWith(`/api/fichas-taxonomicas/${ID}/fotos/f1`);
    expect(onPhotoRemoved).toHaveBeenCalledWith('f1');
    expect(uploadMultipart).toHaveBeenCalledWith(
      'POST',
      `/api/fichas-taxonomicas/${ID}/fotos`,
      {},
      { uri: 'file:///tres.jpg', mimeType: 'image/jpeg' },
      'foto',
    );
    expect(onPhotoAdded).toHaveBeenCalledWith(photo('tres'));
    expect(jest.mocked(apiClient.delete).mock.invocationCallOrder[0]).toBeLessThan(
      jest.mocked(uploadMultipart).mock.invocationCallOrder[0],
    );
    expect(species.photos.map((item) => item.id)).toEqual(['f2', 'f3']);
  });

  it('se detiene en el primer fallo y no avisa lo que no se guardó', async () => {
    jest.mocked(apiClient.delete).mockRejectedValueOnce(new Error('404'));
    const onPhotoRemoved = jest.fn();

    await expect(
      updateSpecies(
        ID,
        { ...INPUT, removedPhotoIds: ['f1'], newPhotos: [photo('tres')] },
        { onPhotoRemoved },
      ),
    ).rejects.toThrow('404');
    expect(onPhotoRemoved).not.toHaveBeenCalled();
    expect(uploadMultipart).not.toHaveBeenCalled();
  });
});
