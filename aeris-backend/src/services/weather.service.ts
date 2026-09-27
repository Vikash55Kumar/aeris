import { WeatherRepository } from '../repositories/weather.repository.js';
import { EventRepository } from '../repositories/event.repository.js';
import { INGESTION_DATA_SOURCES } from '../core/constants.js';

export class WeatherService {
  static async getWeatherIntelligenceOverview(jurisdictionCode = 'mumbai_mmr', offsetHours = 0) {
    const latest = await WeatherRepository.getLatestTelemetry(jurisdictionCode);
    const activeEvents = await EventRepository.findActiveEvents(jurisdictionCode);
    const primaryEvent = activeEvents[0];

    // Hazard risk matrix
    const hazards = {
      rainfallRisk: {
        level: 'high',
        window: 'Next 1 – 3 hours',
        signalBars: 4,
        value: '80–120 mm',
        label: 'Rainfall Risk',
        description: 'Heavy rainfall intensifying over Kurla, BKC, and Eastern Mumbai.',
      },
      thunderstormRisk: {
        level: 'high',
        window: 'Next 1 – 2 hours',
        signalBars: 4,
        value: '85% Probability',
        label: 'Thunderstorm Risk',
        description: 'Frequent lightning and strong convective updrafts aloft.',
      },
      cloudburstRisk: {
        level: 'high',
        window: 'Next 2 – 3 hours',
        signalBars: 4,
        value: 'Elevated Risk',
        label: 'Cloudburst Potential',
        description: 'Extreme thermodynamic instability (CAPE 2,850 J/kg, PW 68.2 mm).',
      },
      floodRisk: {
        level: 'high',
        window: 'Next 2 – 4 hours',
        signalBars: 4,
        value: '5 Corridors Alert',
        label: 'Inundation Risk',
        description: 'Mithi River basin near danger stage; localized waterlogging > 30cm.',
      },
    };

    // Telemetry items with trends & sparkline coordinates
    const telemetryItems = [
      {
        id: 'ctt',
        name: 'Cloud Top Temperature',
        value: `${latest?.cloudTopTempCelsius ?? -72.4} °C`,
        trendText: 'Rapid Cooling',
        trendStatus: 'critical',
        badgeText: 'Rapid Cooling',
        badgeClass: 'bg-[#FFF5F5] text-[#DC2626] border border-[#FED7D7]',
        observed: true,
      },
      {
        id: 'radar',
        name: 'Radar Reflectivity',
        value: `${latest?.radarReflectivityDbz ?? 52.0} dBZ`,
        trendText: 'Increasing',
        trendStatus: 'high',
        badgeText: 'Increasing',
        badgeClass: 'bg-[#FFF5F5] text-[#DC2626] border border-[#FED7D7]',
        observed: true,
      },
      {
        id: 'moisture',
        name: 'Moisture (Atmospheric Baseline)',
        value: 'High CAPE',
        trendText: 'High',
        trendStatus: 'high',
        badgeText: 'High',
        badgeClass: 'bg-[#FFF5F5] text-[#DC2626] border border-[#FED7D7]',
        observed: true,
      },
      {
        id: 'lightning',
        name: 'Lightning Activity',
        value: `${latest?.lightningFlashesPerMin ?? 36} strikes`,
        trendText: 'Increasing',
        trendStatus: 'high',
        badgeText: 'Increasing',
        badgeClass: 'bg-[#FFF5F5] text-[#DC2626] border border-[#FED7D7]',
        observed: true,
      },
      {
        id: 'wind',
        name: 'Wind (Surface)',
        value: `${latest?.windDirection ?? 'NE'} ${latest?.windSpeedKmh ?? 25} km/h`,
        trendText: 'Steady',
        trendStatus: 'normal',
        badgeText: 'Steady',
        badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200',
        observed: true,
      },
    ];

    // Hourly Forecast Steps (-3h to +3h)
    const baseDate = new Date();
    const hourlySteps = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
      const stepDate = new Date(baseDate.getTime() + offset * 60 * 60 * 1000);
      const timeLabel = `${String(stepDate.getHours()).padStart(2, '0')}:${String(stepDate.getMinutes()).padStart(2, '0')}`;
      const offsetLabel = offset === 0 ? 'Now' : offset > 0 ? `+${offset}h` : `${offset}h`;

      let rainRate = 15;
      let thunderProb = 20;
      let cloudburstRisk = 10;
      let isPeak = false;

      if (offset === 0) {
        rainRate = 92;
        thunderProb = 85;
        cloudburstRisk = 75;
      } else if (offset === 1) {
        rainRate = 110;
        thunderProb = 90;
        cloudburstRisk = 88;
        isPeak = true;
      } else if (offset === 2) {
        rainRate = 75;
        thunderProb = 65;
        cloudburstRisk = 50;
      } else if (offset === 3) {
        rainRate = 30;
        thunderProb = 35;
        cloudburstRisk = 20;
      } else if (offset === -1) {
        rainRate = 45;
        thunderProb = 60;
        cloudburstRisk = 30;
      } else if (offset === -2) {
        rainRate = 20;
        thunderProb = 30;
        cloudburstRisk = 15;
      }

      return {
        timeOffset: offsetLabel,
        clockTime: timeLabel,
        statusLabel: offset === 0 ? 'Current' : offset > 0 ? 'Forecast' : 'Past',
        rainfallMmHr: rainRate,
        thunderstormProbPct: thunderProb,
        cloudburstRiskPct: cloudburstRisk,
        isPeak,
      };
    });

    // Pipeline Checklist
    const pipelines = INGESTION_DATA_SOURCES.map((ds) => ({
      id: ds.id,
      name: ds.name,
      agency: ds.agency,
      latency: ds.latency,
      qcScore: ds.qcScore,
      status: ds.status,
    }));

    return {
      hazards,
      telemetryItems,
      hourlySteps,
      pipelines,
      primaryEvent,
      multiModelConsensus: {
        wrfModelRainMm: 95.0,
        gfsModelRainMm: 82.0,
        radarExtrapolationMm: 110.0,
        aiEnsembleConfidencePct: 89.0,
        leadTimeHours: 3.5,
      },
    };
  }

  static async getDetailedAnalysis(category: 'telemetry' | 'timeline' | 'rainfall' | 'thunderstorm' | 'cloudburst') {
    switch (category) {
      case 'telemetry':
        return {
          title: 'Multi-Sensor Atmospheric Telemetry Deep Dive',
          cape: 2850,
          capeUnit: 'J/kg',
          capeStatus: 'Extreme Thermodynamic Instability',
          precipitableWater: 68.2,
          precipitableWaterUnit: 'mm',
          pwStatus: '99th Percentile for July MMR',
          convectiveDeepeningWarning:
            'INSAT-3DR IR1 band shows rapid cloud top cooling from -42°C to -72.4°C within 45 minutes (-8.2°C/hr rate), indicating explosive vertical convective development exceeding the 14km tropopause.',
          ingestionChecklist: [
            { name: 'Santacruz S-Band Doppler (14:18)', status: 'SYNCHRONIZED' },
            { name: 'INSAT-3DR Rapid Scan (14:15)', status: 'SYNCHRONIZED' },
            { name: 'ILDN Lightning Network (Live)', status: 'SYNCHRONIZED' },
            { name: 'IMDAA 4km Reanalysis (12:00 UTC)', status: 'SYNCHRONIZED' },
          ],
        };

      case 'timeline':
        return {
          title: 'Full Event Evolution History & Forecast — Cell A1027',
          summary: 'Cell A1027 has tracked 18km NE over the past 90 minutes. Present core dBZ is 58.5 over Kurla-Chembur basin, transitioning towards Thane MMR.',
          milestones: [
            { time: '11:30 IST', phase: 'Moisture Convergence', desc: 'High moisture convergence along coastal shear zone' },
            { time: '12:20 IST', phase: 'First Echo', desc: 'First radar echo > 35 dBZ at 4.2 km altitude' },
            { time: '13:20 IST', phase: 'Deep Convection', desc: 'Rapid CTT cooling to -60°C; 22 lightning flashes/min' },
            { time: '14:20 IST (NOW)', phase: 'Peak Intensification', desc: 'Max dBZ 58.5; Surface rain rate 95 mm/hr', isCurrent: true },
            { time: '15:20 IST (PROJ)', phase: 'Cloudburst Potential', desc: 'High cloudburst potential over Thane / Eastern Suburbs' },
          ],
        };

      case 'rainfall':
        return {
          title: 'Hourly Rainfall Hyetograph & Ensemble Analysis',
          expectedRangeMm: [80, 120],
          peakTimeWindow: '16:00 – 17:00 IST',
          probOver50mm1h: 88,
          probOver100mm3h: 79,
          ensembleConsensusScore: 0.91,
          description: 'AERIS Nowcasting ensemble projects total cumulative rainfall of 80–120 mm over next 3 hours with peak deluge between 16:00 and 17:00 IST.',
        };

      case 'thunderstorm':
      case 'cloudburst':
      default:
        return {
          title: 'Thunderstorm Convective Initiation & Deluge Assessment',
          verticalUpdraftVelocityMs: 28.5,
          hailAloftDetected: true,
          ndmaProtocolLevel: 'Level 2 Active',
          targetZones: ['BMC Zone 3 (Kurla, Ghatkopar, Chembur)', 'Thane Southern Creek Corridor'],
          advisory: 'Severe convective updrafts with vertical velocity exceeding 28 m/s. Hail formation aloft is detected in radar differential reflectivity (ZDR) signatures.',
        };
    }
  }
}
