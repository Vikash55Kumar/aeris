import { HydrologicalState } from '@/types/hydrology';

export const MOCK_HYDROLOGY: HydrologicalState = {
  basinRunoffM3s: 110,
  soilMoistureSaturationPct: 88,
  peakRunoffEta: '16:30 IST (+2h 10m)',
  gauges: [
    { id: 'g-1', name: 'Kranti Nagar (Kurla)', location: 'Upper Mithi', currentLevelM: 2.85, warningLevelM: 3.20, dangerLevelM: 3.80, trendPerHourM: 0.35, capacityPct: 75, status: 'warning' },
    { id: 'g-2', name: 'CST Road Bridge', location: 'Mid Mithi', currentLevelM: 2.40, warningLevelM: 3.00, dangerLevelM: 3.60, trendPerHourM: 0.20, capacityPct: 66, status: 'elevated' },
    { id: 'g-3', name: 'BKC Culvert Outfall', location: 'Lower Mithi', currentLevelM: 1.95, warningLevelM: 2.80, dangerLevelM: 3.40, trendPerHourM: 0.15, capacityPct: 57, status: 'moderate' },
    { id: 'g-4', name: 'Mahim Bay Estuary', location: 'Tidal Mouth', currentLevelM: 1.60, warningLevelM: 2.50, dangerLevelM: 3.20, trendPerHourM: 0.08, capacityPct: 50, status: 'normal' },
  ],
};
