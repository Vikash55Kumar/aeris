import { AerisEvent } from '@/types/event';

export const MOCK_ACTIVE_EVENT: AerisEvent = {
  id: 'EVT-2025-07-21-004',
  code: 'MCS-MUMBAI-04',
  title: 'Severe Convective System',
  type: 'Mesoscale Convective Storm',
  stage: 'intensification',
  severity: 'high',
  confidencePct: 87,
  description: 'Intense rainfall expected over Eastern & Central Mumbai in next 2–3 hours with risk of localized cloudburst.',
  detectedAt: '2025-07-21T13:45:00+05:30',
  expectedOnset: '2025-07-21T14:30:00+05:30',
  expectedPeak: '2025-07-21T16:30:00+05:30',
  location: {
    lat: 19.0728,
    lon: 72.8826,
    name: 'Mithi River Basin Corridor',
  },
  movement: {
    direction: 'NE',
    speedKmh: 25,
  },
  expectedRainfallRangeMm: [80, 120],
  peakDurationHours: [2, 3],
  affectedAreas: [
    { rank: 1, name: 'Kurla, Kalina, Santa Cruz', severity: 'very_high' },
    { rank: 2, name: 'BKC, Bandra East', severity: 'high' },
    { rank: 3, name: 'Chembur, Govandi', severity: 'high' },
    { rank: 4, name: 'Andheri, Jogeshwari', severity: 'moderate' },
    { rank: 5, name: 'Eastern Suburbs (Thane border)', severity: 'moderate' },
  ],
};
