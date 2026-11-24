import { WETLAND_CENTER } from '../constants';
import { type TrailMap } from '../types';
import { getPickerInitialViewState } from './map-location-picker';

const EMPTY_MAP: TrailMap = { version: '1', bounds: null, segments: [], stations: [] };
const WETLAND_LNG_LAT = [WETLAND_CENTER.longitude, WETLAND_CENTER.latitude];

describe('getPickerInitialViewState (SCRUM-72)', () => {
  it('centra en el punto ya elegido', () => {
    const viewState = getPickerInitialViewState({ latitude: 2.5, longitude: -76.5 }, undefined);
    expect(viewState).toMatchObject({ center: [-76.5, 2.5] });
  });

  it('sin punto ni sendero, abre en el humedal', () => {
    expect(getPickerInitialViewState(null, EMPTY_MAP)).toMatchObject({ center: WETLAND_LNG_LAT });
    expect(getPickerInitialViewState(null, undefined)).toMatchObject({ center: WETLAND_LNG_LAT });
  });

  it('sin punto, encuadra el sendero si ya cargó', () => {
    const map: TrailMap = {
      ...EMPTY_MAP,
      stations: [
        {
          id: 'e-1',
          name: 'Estación 1',
          description: null,
          photoUrl: null,
          coordinates: { latitude: 2.46, longitude: -76.61 },
          species: [],
        },
      ],
    };
    expect(getPickerInitialViewState(null, map)).toHaveProperty('bounds');
  });
});
