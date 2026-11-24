import { type TrailMap } from '../types';
import {
  fromLngLat,
  getInitialViewState,
  getLocationViewState,
  LOCATION_ZOOM,
  toLngLat,
} from './map-camera';

const EMPTY_MAP: TrailMap = { version: '1', bounds: null, segments: [], stations: [] };

describe('map-camera', () => {
  it('convierte entre { latitude, longitude } y [longitud, latitud]', () => {
    expect(toLngLat({ latitude: 2.46, longitude: -76.61 })).toEqual([-76.61, 2.46]);
    expect(fromLngLat([-76.61, 2.46])).toEqual({ latitude: 2.46, longitude: -76.61 });
  });

  it('encuadra tramos y estaciones como [oeste, sur, este, norte] con margen', () => {
    const map: TrailMap = {
      ...EMPTY_MAP,
      segments: [
        {
          id: 't-1',
          name: 'Tramo 1',
          order: 1,
          coordinates: [
            { latitude: 2.45, longitude: -76.62 },
            { latitude: 2.47, longitude: -76.6 },
          ],
        },
      ],
    };

    const viewState = getInitialViewState(map);

    expect(viewState).toMatchObject({ padding: { top: 48, right: 48, bottom: 48, left: 48 } });
    expect('bounds' in viewState && viewState.bounds).toEqual([
      expect.closeTo(-76.62),
      expect.closeTo(2.45),
      expect.closeTo(-76.6),
      expect.closeTo(2.47),
    ]);
  });

  it('usa los bounds del backend y les da un tamaño mínimo si el recorrido es un punto', () => {
    const point = { latitude: 2.46, longitude: -76.61 };
    const viewState = getInitialViewState({
      ...EMPTY_MAP,
      bounds: { southWest: point, northEast: point },
    });

    expect('bounds' in viewState && viewState.bounds).toEqual([
      expect.closeTo(-76.611),
      expect.closeTo(2.459),
      expect.closeTo(-76.609),
      expect.closeTo(2.461),
    ]);
  });

  it('falla si el mapa no tiene coordenadas', () => {
    expect(() => getInitialViewState(EMPTY_MAP)).toThrow('No se puede encuadrar');
  });

  it('centra la ubicación con zoom cercano', () => {
    expect(getLocationViewState({ latitude: 2.46, longitude: -76.61 })).toEqual({
      center: [-76.61, 2.46],
      zoom: LOCATION_ZOOM,
    });
  });
});
