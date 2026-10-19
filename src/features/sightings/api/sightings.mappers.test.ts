import { toSighting, toSightingFields, toSightingPage } from './sightings.mappers';

const DTO = {
  id: '0f8e6a1c-3b2d-4c5e-9f10-7a6b5c4d3e2f',
  occurrenceRemarks: 'Vi un ave azul comiendo frutos en el borde del humedal',
  kingdom: 'ANIMALIA',
  vernacularName: 'Azulejo',
  decimalLatitude: 2.4598,
  decimalLongitude: -76.6115,
  recordedBy: 'Ana Gómez',
  urlFoto: 'http://localhost:9000/orquidea/reportes/5b1d.jpg',
  estado: 'APROBADO',
  fechaCreacion: '2026-10-08T15:30:00Z',
  fechaRevision: '2026-10-09T10:00:00Z',
};

describe('toSighting', () => {
  it('traduce un OccurrenceDto completo al modelo de la app', () => {
    expect(toSighting(DTO)).toEqual({
      id: DTO.id,
      remarks: DTO.occurrenceRemarks,
      kingdom: 'animalia',
      vernacularName: 'Azulejo',
      location: { latitude: 2.4598, longitude: -76.6115 },
      author: 'Ana Gómez',
      photoUrl: DTO.urlFoto,
      status: 'approved',
      createdAt: DTO.fechaCreacion,
      reviewedAt: DTO.fechaRevision,
    });
  });

  it('trata "Desconocido", sin lugar y sin foto como valores ausentes (HU-18 CA3)', () => {
    const sighting = toSighting({
      ...DTO,
      kingdom: 'DESCONOCIDO',
      vernacularName: 'Desconocido',
      decimalLatitude: null,
      decimalLongitude: null,
      urlFoto: null,
      estado: 'PENDIENTE',
      fechaRevision: null,
    });
    expect(sighting.kingdom).toBe('unknown');
    expect(sighting.vernacularName).toBeNull();
    expect(sighting.location).toBeNull();
    expect(sighting.photoUrl).toBeNull();
    expect(sighting.status).toBe('pending');
    expect(sighting.reviewedAt).toBeNull();
  });

  it('lanza si la respuesta no cumple el contrato', () => {
    expect(() => toSighting({ ...DTO, kingdom: 'PEZ' })).toThrow();
  });
});

describe('toSightingPage', () => {
  it('traduce la página y sus elementos', () => {
    const page = toSightingPage({
      contenido: [DTO],
      pagina: 0,
      tamano: 10,
      totalElementos: 1,
      totalPaginas: 1,
    });
    expect(page.page).toBe(0);
    expect(page.totalPages).toBe(1);
    expect(page.items).toHaveLength(1);
  });
});

describe('toSightingFields', () => {
  it('envía todos los campos y las coordenadas juntas', () => {
    expect(
      toSightingFields({
        remarks: '  Vi un azulejo  ',
        kingdom: 'animalia',
        vernacularName: ' Azulejo ',
        location: { latitude: 2.4598, longitude: -76.6115 },
        photo: null,
      }),
    ).toEqual({
      occurrenceRemarks: 'Vi un azulejo',
      kingdom: 'ANIMALIA',
      vernacularName: 'Azulejo',
      decimalLatitude: '2.4598',
      decimalLongitude: '-76.6115',
    });
  });

  it('con datos desconocidos envía DESCONOCIDO y omite clasificación y lugar (HU-18 CA3)', () => {
    expect(
      toSightingFields({
        remarks: 'Escuché un canto',
        kingdom: 'unknown',
        vernacularName: '   ',
        location: null,
        photo: null,
      }),
    ).toEqual({ occurrenceRemarks: 'Escuché un canto', kingdom: 'DESCONOCIDO' });
  });
});
