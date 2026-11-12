import { WETLAND_CENTER } from '../constants';
import { type TrailMap } from '../types';
import { getPickerInitialRegion } from './map-location-picker';

const EMPTY_MAP: TrailMap = { version: '1', bounds: null, segments: [], stations: [] };

describe('getPickerInitialRegion (SCRUM-72)', () => {
  it('centra en el punto ya elegido', () => {
    const region = getPickerInitialRegion({ latitude: 2.5, longitude: -76.5 }, undefined);
    expect(region).toMatchObject({ latitude: 2.5, longitude: -76.5 });
  });

  it('sin punto ni sendero, abre en el humedal', () => {
    expect(getPickerInitialRegion(null, EMPTY_MAP)).toMatchObject(WETLAND_CENTER);
    expect(getPickerInitialRegion(null, undefined)).toMatchObject(WETLAND_CENTER);
  });
});
