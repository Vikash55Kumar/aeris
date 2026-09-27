export interface GeoCoordinates {
  lat: number;
  lon: number;
  elevationM?: number;
}

export interface GeoPoint extends GeoCoordinates {
  name?: string;
  landmark?: string;
}

export interface GeoBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface BasinGeography {
  id: string;
  name: string;
  state: string;
  center: GeoCoordinates;
  bounds: GeoBoundingBox;
  subBasins: string[];
}
