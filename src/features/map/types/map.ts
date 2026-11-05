export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type MapBounds = {
  southWest: Coordinates;
  northEast: Coordinates;
};

export type TrailSegment = {
  id: string;
  name: string;
  order: number;
  coordinates: Coordinates[];
};

export type StationTaxon = {
  id: string;
  commonName: string;
  photoUrl: string | null;
};

export type TrailStation = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  coordinates: Coordinates;
  species: StationTaxon[];
};

export type TrailMap = {
  version: string;
  bounds: MapBounds | null;
  segments: TrailSegment[];
  stations: TrailStation[];
};
