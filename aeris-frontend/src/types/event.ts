import { GeoPoint, GeoCoordinates } from './geo';
import { RiskLevel } from './weather';

export type EventStage =
  | 'moisture_accumulation'
  | 'convective_initiation'
  | 'intensification'
  | 'heavy_rainfall'
  | 'cloudburst_potential'
  | 'hydrological_response'
  | 'flood_risk'
  | 'decay';

export interface AerisEvent {
  id: string;
  code: string;
  title: string;
  type: string;
  stage: EventStage;
  severity: RiskLevel;
  confidencePct: number;
  description: string;
  detectedAt: string;
  expectedOnset?: string;
  expectedPeak?: string;
  location: GeoPoint;
  movement: {
    direction: string;
    speedKmh: number;
  };
  expectedRainfallRangeMm: [number, number];
  peakDurationHours: [number, number];
  affectedAreas: {
    rank: number;
    name: string;
    severity: RiskLevel;
    coordinates?: GeoCoordinates;
  }[];
}
