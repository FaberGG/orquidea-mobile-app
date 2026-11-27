import { createOfflineMapStyle, OFFLINE_SOURCE_ID } from './offline-map-style';

const URL = 'pmtiles://file://doc/bundled-maps/popayan-z14-abc.pmtiles';

describe('createOfflineMapStyle (SCRUM-85)', () => {
  it('usa el PMTiles como fuente vectorial OpenMapTiles', () => {
    const style = createOfflineMapStyle(URL);
    expect(style.sources[OFFLINE_SOURCE_ID]).toEqual({ type: 'vector', url: URL });
  });

  it('no necesita glyphs ni sprites (sin capas de texto) ni mueve la cámara', () => {
    const style = createOfflineMapStyle(URL);
    expect(style.layers.some((layer) => layer.type === 'symbol')).toBe(false);
    expect(style).not.toHaveProperty('glyphs');
    expect(style).not.toHaveProperty('center');
    expect(style).not.toHaveProperty('zoom');
  });
});
