import { GeoCoordinates } from './geo';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'very_high' | 'critical';

export interface AtmosphericObservations {
  cloudTopTempCelsius: number;
  coolingRatePerHour: number;
  radarReflectivityDbz: number;
  dopplerRadialVelocityKt: number;
  lightningFlashesPerMin: number;
  precipitableWaterMm: number;
  capeJkg: number;
  surfacePrecipRateMmHr: number;
  timestamp: string;
}

export interface WeatherHazardSummary {
  rainfallRisk: {
    level: RiskLevel;
    window: string;
    signalBars: number;
    value: string;
  };
  thunderstormRisk: {
    level: RiskLevel;
    window: string;
    signalBars: number;
    value: string;
  };
  cloudburstRisk: {
    level: RiskLevel;
    window: string;
    signalBars: number;
    value: string;
  };
  floodRisk: {
    level: RiskLevel;
    window: string;
    signalBars: number;
    value: string;
  };
}
