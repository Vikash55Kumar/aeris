export interface RiverGaugeStation {
  id: string;
  name: string;
  location: string;
  currentLevelM: number;
  warningLevelM: number;
  dangerLevelM: number;
  trendPerHourM: number;
  capacityPct: number;
  status: 'normal' | 'moderate' | 'elevated' | 'warning' | 'danger';
}

export interface HydrologicalState {
  basinRunoffM3s: number;
  soilMoistureSaturationPct: number;
  peakRunoffEta: string;
  gauges: RiverGaugeStation[];
}
