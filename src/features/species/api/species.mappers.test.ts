import { CONSERVATION_CODES, CONSERVATION_STATUSES } from '../constants';
import { toSpecies, toSpeciesList } from './species.mappers';

const DTO = {
  id: '5b0c7f0e-2f5d-4a8e-9a57-0c7d3c1b6e21',
  categoria: 'AVE',
  order: 'Passeriformes',
  family: 'Thraupidae',
  genus: 'Thraupis',
  scientificName: 'Thraupis episcopus',
  vernacularName: 'Azulejo',
  alimentacion: 'Frutos, néctar e insectos pequeños',
  rolEnHumedal: 'Dispersor de semillas',
  estadoConservacion: 'LC',
  urlFoto: 'http://localhost:9000/orquidea/fichas/5b0c7f0e.jpg',
};

describe('species mappers', () => {
  it('traduce TaxonDto a Species (categoría, campos y foto)', () => {
    expect(toSpecies(DTO)).toEqual({
      id: DTO.id,
      category: 'bird',
      order: 'Passeriformes',
      family: 'Thraupidae',
      genus: 'Thraupis',
      scientificName: 'Thraupis episcopus',
      vernacularName: 'Azulejo',
      diet: 'Frutos, néctar e insectos pequeños',
      wetlandRole: 'Dispersor de semillas',
      conservationStatus: 'LC',
      photoUrl: DTO.urlFoto,
    });
  });

  it('mapea PLANTA e INSECTO y deja null los campos opcionales vacíos', () => {
    const plant = toSpecies({
      ...DTO,
      categoria: 'PLANTA',
      order: '',
      family: null,
      alimentacion: null,
      rolEnHumedal: '',
      urlFoto: null,
    });
    expect(plant.category).toBe('plant');
    expect(plant.order).toBeNull();
    expect(plant.family).toBeNull();
    expect(plant.diet).toBeNull();
    expect(plant.wetlandRole).toBeNull();
    expect(plant.photoUrl).toBeNull();
    expect(toSpecies({ ...DTO, categoria: 'INSECTO' }).category).toBe('insect');
  });

  it('rechaza una respuesta que no cumple el contrato', () => {
    expect(() => toSpecies({ ...DTO, categoria: 'MAMIFERO' })).toThrow();
    expect(() => toSpecies({ ...DTO, estadoConservacion: 'XX' })).toThrow();
  });

  it('traduce un listado vacío y uno con elementos', () => {
    expect(toSpeciesList([])).toEqual([]);
    expect(toSpeciesList([DTO, { ...DTO, id: 'otro' }])).toHaveLength(2);
  });
});

describe('estados de conservación', () => {
  it('modela todos los códigos que acepta la API', () => {
    expect(Object.keys(CONSERVATION_STATUSES).sort()).toEqual([...CONSERVATION_CODES].sort());
    expect(CONSERVATION_CODES).toHaveLength(9);
  });

  it('cada nivel tiene etiqueta y colores de la leyenda del diseño', () => {
    for (const code of CONSERVATION_CODES) {
      const { label, background, text } = CONSERVATION_STATUSES[code];
      expect(label.length).toBeGreaterThan(0);
      expect(background).toMatch(/^#[0-9A-F]{6}$/i);
      expect(text).toMatch(/^#[0-9A-F]{6}$/i);
    }
    expect(CONSERVATION_STATUSES.CR.background).toBe('#D81E05');
    expect(CONSERVATION_STATUSES.EN.background).toBe('#FC7F3F');
    expect(CONSERVATION_STATUSES.LC.background).toBe('#60C659');
  });
});
