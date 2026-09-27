import { HourlyForecastStep } from '@/types/forecast';
import { WeatherHazardSummary } from '@/types/weather';

export const MOCK_HAZARD_SUMMARY: WeatherHazardSummary = {
  rainfallRisk: {
    level: 'high',
    window: 'Next 3 hours',
    signalBars: 3,
    value: 'High',
  },
  thunderstormRisk: {
    level: 'high',
    window: 'Next 3 hours',
    signalBars: 3,
    value: 'High',
  },
  cloudburstRisk: {
    level: 'moderate',
    window: 'Next 6 hours',
    signalBars: 2,
    value: 'Moderate',
  },
  floodRisk: {
    level: 'high',
    window: 'Next 6 hours',
    signalBars: 3,
    value: 'High',
  },
};

export const MOCK_TIMELINE_STEPS: HourlyForecastStep[] = [
  { timeOffset: 'Now', clockTime: '14:20', statusLabel: 'Light Rain', rainfallMmHr: 12, thunderstormProbPct: 35, cloudburstRiskPct: 15, floodRiskPct: 20 },
  { timeOffset: '+1h', clockTime: '15:20', statusLabel: 'Heavy Rainfall', rainfallMmHr: 48, thunderstormProbPct: 65, cloudburstRiskPct: 28, floodRiskPct: 52 },
  { timeOffset: '+2–3h', clockTime: '16:20–17:20', statusLabel: 'Peak Intensity (High Risk)', rainfallMmHr: 95, thunderstormProbPct: 82, cloudburstRiskPct: 45, floodRiskPct: 88, isPeak: true },
  { timeOffset: '+4–6h', clockTime: '18:20–20:20', statusLabel: 'Gradual Decrease', rainfallMmHr: 18, thunderstormProbPct: 25, cloudburstRiskPct: 10, floodRiskPct: 40 },
];
