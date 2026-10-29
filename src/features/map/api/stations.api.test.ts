import { apiClient, uploadMultipart } from '@/lib/api';

import { type StationInput } from '../types';
import { createStation, deleteStation, listStations, updateStation } from './stations.api';
import { toStation, toStationFields } from './stations.mappers';

jest.mock('@/lib/api', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  uploadMultipart: jest.fn(),
}));

const DTO = {
  id: 'e-1',
  nombre: 'Mirador de la laguna',
  descripcion: 'Se observan garzas.',
  urlFoto: 'http://localhost:9000/estaciones/e-1.jpg',
  decimalLatitude: 2.4598,
  decimalLongitude: -76.6115,
  fichas: [{ id: 'ave-1', vernacularName: 'Garza real', urlFoto: null }],
};

const INPUT: StationInput = {
  name: ' Mirador de la laguna ',
  description: 'Se observan garzas.',
  location: { latitude: 2.4598, longitude: -76.6115 },
  speciesIds: ['ave-1', 'ave-2'],
  photo: null,
};

beforeEach(() => jest.clearAllMocks());

describe('stations mappers (contrato inferido SCRUM-40)', () => {
  it('traduce EstacionDto a Station', () => {
    expect(toStation(DTO)).toEqual({
      id: 'e-1',
      name: 'Mirador de la laguna',
      description: 'Se observan garzas.',
      photoUrl: DTO.urlFoto,
      location: { latitude: 2.4598, longitude: -76.6115 },
      species: [{ id: 'ave-1', vernacularName: 'Garza real', photoUrl: null }],
    });
  });

  it('acepta una estación sin fichas ni foto', () => {
    const station = toStation({ ...DTO, urlFoto: null, fichas: undefined });
    expect(station.species).toEqual([]);
    expect(station.photoUrl).toBeNull();
  });

  it('rechaza una respuesta sin coordenadas', () => {
    expect(() => toStation({ ...DTO, decimalLatitude: null })).toThrow();
  });

  it('envía fichaIds separado por comas y lo omite si no hay fichas', () => {
    expect(toStationFields(INPUT)).toEqual({
      nombre: 'Mirador de la laguna',
      descripcion: 'Se observan garzas.',
      decimalLatitude: '2.4598',
      decimalLongitude: '-76.6115',
      fichaIds: 'ave-1,ave-2',
    });
    expect(toStationFields({ ...INPUT, speciesIds: [] })).not.toHaveProperty('fichaIds');
  });
});

describe('stations api', () => {
  it('lista las estaciones sin token', async () => {
    jest.mocked(apiClient.get).mockResolvedValue([DTO]);
    const stations = await listStations();
    expect(apiClient.get).toHaveBeenCalledWith('/api/estaciones', { authenticated: false });
    expect(stations).toHaveLength(1);
  });

  it('crea con la foto en el campo `foto`', async () => {
    jest.mocked(uploadMultipart).mockResolvedValue(DTO);
    await createStation({
      ...INPUT,
      photo: { uri: 'file:///e.jpg', fileName: 'e.jpg', mimeType: 'image/jpeg', fileSize: 10 },
    });
    expect(uploadMultipart).toHaveBeenCalledWith(
      'POST',
      '/api/estaciones',
      expect.objectContaining({ fichaIds: 'ave-1,ave-2' }),
      { uri: 'file:///e.jpg', mimeType: 'image/jpeg' },
      'foto',
    );
  });

  it('edita sin foto nueva con multipart de texto', async () => {
    jest.mocked(apiClient.put).mockResolvedValue(DTO);
    await updateStation('e-1', INPUT);
    expect(apiClient.put).toHaveBeenCalledWith('/api/estaciones/e-1', {
      formData: expect.any(FormData),
    });
    expect(uploadMultipart).not.toHaveBeenCalled();
  });

  it('elimina por id', async () => {
    await deleteStation('e-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/api/estaciones/e-1');
  });
});
