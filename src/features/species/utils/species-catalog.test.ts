import { type Species } from '../types';
import {
  getSpeciesOfflineState,
  speciesPhotoUrls,
  summarizeSpeciesOffline,
} from './species-catalog';

const BASE: Species = {
  id: 'ave-1',
  category: 'bird',
  order: 'Passeriformes',
  family: 'Thraupidae',
  genus: 'Thraupis',
  scientificName: 'Thraupis episcopus',
  vernacularName: 'Azulejo',
  diet: null,
  wetlandRole: null,
  conservationStatus: 'LC',
  photoUrl: 'https://r2.example/a1.jpg',
  thumbnailUrl: 'https://r2.example/mini/a1.jpg',
  photos: [
    { id: 'f1', url: 'https://r2.example/a1.jpg' },
    { id: 'f2', url: 'https://r2.example/a2.jpg' },
  ],
};

const SIN_FOTOS = { ...BASE, id: 'planta-1', photoUrl: null, thumbnailUrl: null, photos: [] };

const onDisk = (...urls: string[]) => {
  const saved = new Set(urls);
  return (url: string) => saved.has(url);
};

describe('ficha descargada (HU-21)', () => {
  it('necesita la miniatura y todas las fotos del detalle', () => {
    expect(speciesPhotoUrls(BASE)).toEqual([
      'https://r2.example/mini/a1.jpg',
      'https://r2.example/a1.jpg',
      'https://r2.example/a2.jpg',
    ]);
    expect(getSpeciesOfflineState(BASE, onDisk(...speciesPhotoUrls(BASE)))).toBe('complete');
  });

  it('le falta la miniatura o una foto del detalle', () => {
    expect(
      getSpeciesOfflineState(
        BASE,
        onDisk('https://r2.example/a1.jpg', 'https://r2.example/a2.jpg'),
      ),
    ).toBe('missing-photos');
    expect(
      getSpeciesOfflineState(
        BASE,
        onDisk('https://r2.example/mini/a1.jpg', 'https://r2.example/a1.jpg'),
      ),
    ).toBe('missing-photos');
  });

  it('una ficha sin fotos cuenta como completa', () => {
    expect(getSpeciesOfflineState(SIN_FOTOS, onDisk())).toBe('complete');
  });

  it('resume cuántas fichas están completas', () => {
    expect(summarizeSpeciesOffline([BASE, SIN_FOTOS], onDisk())).toEqual({ total: 2, complete: 1 });
  });
});
