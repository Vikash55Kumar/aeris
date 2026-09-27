export interface HourlyForecastStep {
  timeOffset: string;
  clockTime: string;
  statusLabel: string;
  rainfallMmHr: number;
  thunderstormProbPct: number;
  cloudburstRiskPct: number;
  floodRiskPct: number;
  isPeak?: boolean;
}

export interface ForecastConsensus {
  wrfModelRainMm: number;
  gfsModelRainMm: number;
  radarExtrapolationMm: number;
  aiEnsembleConfidencePct: number;
  leadTimeHours: number;
}
