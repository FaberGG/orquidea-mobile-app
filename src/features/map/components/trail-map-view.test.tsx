import { render, screen } from '@testing-library/react-native';

import { WETLAND_ILLUSTRATION } from '../constants';
import { type TrailMap } from '../types';
import { TrailMapView } from './trail-map-view';

const MAP: TrailMap = {
  version: '1',
  bounds: null,
  segments: [
    {
      id: 's1',
      name: 'Tramo 1',
      order: 1,
      coordinates: [
        { latitude: 2.457, longitude: -76.632 },
        { latitude: 2.458, longitude: -76.631 },
      ],
    },
  ],
  stations: [],
};

describe('TrailMapView (SCRUM-84)', () => {
  it('usa la fuente elegida y conecta los eventos de carga del estilo', async () => {
    const source = { mapStyle: 'estilo', onStyleLoaded: jest.fn(), onLoadFailed: jest.fn() };
    await render(
      <TrailMapView
        map={MAP}
        location={null}
        nearestStationId={null}
        onStationPress={jest.fn()}
        source={source}
      />,
    );

    const map = screen.getByLabelText('Mapa del sendero con sus estaciones');
    expect(map.props.mapStyle).toBe('estilo');
    expect(map.props.onDidFinishLoadingStyle).toBe(source.onStyleLoaded);
    expect(map.props.onDidFailLoadingMap).toBe(source.onLoadFailed);
  });

  it('dibuja la ilustración del humedal debajo del sendero, desde zoom 15', async () => {
    await render(
      <TrailMapView
        map={MAP}
        location={null}
        nearestStationId={null}
        onStationPress={jest.fn()}
        source={{ mapStyle: 'estilo', onStyleLoaded: jest.fn(), onLoadFailed: jest.fn() }}
      />,
    );

    const illustration = screen.getByTestId('ImageSource');
    expect(illustration.props.coordinates).toEqual(WETLAND_ILLUSTRATION.coordinates);
    const layers = screen.getAllByTestId('Layer').map((layer) => layer.props.id);
    expect(layers).toEqual(['wetland-illustration-layer', 'trail-segments-line']);
    expect(screen.getAllByTestId('Layer')[0].props.minzoom).toBe(15);
  });
});
