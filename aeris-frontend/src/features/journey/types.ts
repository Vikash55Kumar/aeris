export type TravelMode = 'car' | 'bike' | 'transit' | 'emergency';
export type RouteStrategy = 'balanced' | 'fastest' | 'safer';
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type MapBasemapType = 'streets' | 'satellite-labels' | 'osm' | 'dark';

export interface LocationItem {
  id: string;
  name: string;
  subname: string;
  coords: [number, number];
  type: 'airport' | 'city' | 'suburb' | 'business' | 'transit';
}

export interface RouteSegment {
  id: string;
  from: string;
  to: string;
  distance: string;
  distanceKm: number;
  durationMin: number;
  timeWindow: string;
  weatherCondition: string;
  weatherIcon: 'light' | 'moderate' | 'heavy' | 'thunder';
  rainfallRate: string;
  floodDepth: string;
  risk: RiskLevel;
  nodeColor: string;
  alert?: string | null;
}

export interface DepartureOption {
  time: string;
  journeyTime: string;
  risk: RiskLevel;
  reason: string;
  isRecommended?: boolean;
  score: number;
  highRiskSegment?: string;
  stormCenterRelative: string;
}

export interface JourneyRoute {
  id: RouteStrategy;
  name: string;
  shortLabel: string;
  tradeoffTag: string;
  distance: string;
  duration: string;
  risk: RiskLevel;
  description: string;
  coords: Array<[number, number]>;
  getSegments: (departureTime: string, mode: TravelMode) => RouteSegment[];
}

export interface CorridorPreset {
  id: string;
  title: string;
  from: string;
  to: string;
  defaultTime: string;
}
