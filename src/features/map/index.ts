// API pública de la feature del mapa (HE-05).
export { MapScreen } from './components/map-screen';
export { StationCreateScreen } from './components/station-create-screen';
export { StationDetailScreen } from './components/station-detail-screen';
export { StationEditScreen } from './components/station-edit-screen';
export { StationsListScreen } from './components/stations-list-screen';
export { MapLocationPicker, type MapLocationPickerProps } from './components/map-location-picker';
export { LOCATION_PICKER_LABELS, MAP_LABELS, STATION_LABELS } from './constants';
export { getDistanceInMeters, getNearestStation, toTrailMap } from './api';
export type {
  Coordinates,
  MapBounds,
  StationTaxon,
  TrailMap,
  TrailSegment,
  TrailStation,
} from './types';
