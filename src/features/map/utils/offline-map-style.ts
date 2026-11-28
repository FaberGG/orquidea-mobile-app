import { type StyleSpecification } from '@maplibre/maplibre-react-native';

/** Nombre de la fuente vectorial, el mismo que usa el estilo de OpenFreeMap. */
export const OFFLINE_SOURCE_ID = 'openmaptiles';

/**
 * SCRUM-85: estilo **provisional** para el mapa offline (PMTiles de Popayán, esquema OpenMapTiles). Solo
 * dibuja agua, vegetación, parques, edificios y vías: sin etiquetas ni íconos, porque los glyphs y sprites
 * empaquetados llegan con el estilo propio (tarea 3 del plan del mapa, SCRUM-82), que lo reemplazará. No
 * incluye `center` ni `zoom` para no mover la cámara al cambiar de estilo.
 */
export function createOfflineMapStyle(tilesUrl: string): StyleSpecification {
  return {
    version: 8,
    name: 'Terravia sin conexión (provisional)',
    sources: {
      [OFFLINE_SOURCE_ID]: { type: 'vector', url: tilesUrl },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#f6f3ee' } },
      {
        id: 'landuse-residential',
        type: 'fill',
        source: OFFLINE_SOURCE_ID,
        'source-layer': 'landuse',
        filter: ['==', ['get', 'class'], 'residential'],
        paint: { 'fill-color': '#ece7e1' },
      },
      {
        id: 'landcover-wood',
        type: 'fill',
        source: OFFLINE_SOURCE_ID,
        'source-layer': 'landcover',
        filter: ['==', ['get', 'class'], 'wood'],
        paint: { 'fill-color': '#cfe3bd' },
      },
      {
        id: 'landcover-green',
        type: 'fill',
        source: OFFLINE_SOURCE_ID,
        'source-layer': 'landcover',
        filter: ['in', ['get', 'class'], ['literal', ['grass', 'wetland', 'farmland']]],
        paint: { 'fill-color': '#e2eed3' },
      },
      {
        id: 'park',
        type: 'fill',
        source: OFFLINE_SOURCE_ID,
        'source-layer': 'park',
        paint: { 'fill-color': '#d5ebc3' },
      },
      {
        id: 'water',
        type: 'fill',
        source: OFFLINE_SOURCE_ID,
        'source-layer': 'water',
        paint: { 'fill-color': '#a9d0ea' },
      },
      {
        id: 'waterway',
        type: 'line',
        source: OFFLINE_SOURCE_ID,
        'source-layer': 'waterway',
        paint: {
          'line-color': '#a9d0ea',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 15, 2, 18, 8],
        },
      },
      {
        id: 'building',
        type: 'fill',
        source: OFFLINE_SOURCE_ID,
        'source-layer': 'building',
        minzoom: 13,
        paint: { 'fill-color': '#ddd5cb', 'fill-outline-color': '#cfc5b9' },
      },
      {
        id: 'road-path',
        type: 'line',
        source: OFFLINE_SOURCE_ID,
        'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['path', 'track']]],
        paint: { 'line-color': '#b8a58f', 'line-width': 1, 'line-dasharray': [2, 2] },
      },
      {
        id: 'road-minor',
        type: 'line',
        source: OFFLINE_SOURCE_ID,
        'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['minor', 'service']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 15, 2, 18, 8],
        },
      },
      {
        id: 'road-major',
        type: 'line',
        source: OFFLINE_SOURCE_ID,
        'source-layer': 'transportation',
        filter: [
          'in',
          ['get', 'class'],
          ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']],
        ],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#f7d38a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 4, 18, 12],
        },
      },
    ],
  };
}
