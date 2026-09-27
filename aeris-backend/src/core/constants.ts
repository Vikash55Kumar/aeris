export const METEOROLOGICAL_THRESHOLDS = {
  // Radar Reflectivity (dBZ)
  RADAR_LIGHT_DBZ: 25.0,
  RADAR_MODERATE_DBZ: 35.0,
  RADAR_HEAVY_DBZ: 45.0,
  RADAR_SEVERE_DBZ: 55.0,
  RADAR_EXTREME_DBZ: 60.0,

  // Cloud Top Temperature (°C)
  CTT_DEEP_CONVECTION_CELSIUS: -60.0,
  CTT_SEVERE_STORM_CELSIUS: -70.0,
  CTT_RAPID_COOLING_RATE_PER_HR: -8.0,

  // Convective Available Potential Energy (J/kg)
  CAPE_MODERATE: 1500,
  CAPE_HIGH: 2500,
  CAPE_EXTREME: 3500,

  // Precipitable Water (mm)
  PW_HIGH_MM: 55.0,
  PW_EXTREME_MM: 65.0,

  // Rainfall Intensity (mm/hr)
  RAIN_LIGHT_MM_HR: 7.5,
  RAIN_MODERATE_MM_HR: 30.0,
  RAIN_HEAVY_MM_HR: 64.5,
  RAIN_VERY_HEAVY_MM_HR: 115.5,
  RAIN_CLOUDBURST_MM_HR: 100.0, // 100mm in 1 hour over a 20-30 km² area
};

export const INGESTION_DATA_SOURCES = [
  { id: 'radar', name: 'IMD S-Band Doppler Radar', agency: 'IMD Mumbai', type: 'Radar', latency: '45s', qcScore: 99.8, status: 'OPTIMAL' },
  { id: 'insat', name: 'INSAT-3DR Rapid Scan', agency: 'ISRO / IMD', type: 'Satellite', latency: '2m', qcScore: 99.4, status: 'OPTIMAL' },
  { id: 'imdaa', name: 'IMDAA Mesoscale NWP', agency: 'NCMRWF', type: 'Atmospheric', latency: '15m', qcScore: 98.9, status: 'OPTIMAL' },
  { id: 'cwc', name: 'Mithi River Telemetry', agency: 'CWC / MCGM', type: 'Hydrology', latency: '30s', qcScore: 100.0, status: 'OPTIMAL' },
  { id: 'aws', name: 'Automatic Weather Stations', agency: 'MCGM / IMD', type: 'Precipitation', latency: '1m', qcScore: 99.1, status: 'OPTIMAL' },
  { id: 'lightning', name: 'Lightning Location Network', agency: 'IITM Pune', type: 'Lightning', latency: '10s', qcScore: 99.9, status: 'OPTIMAL' },
] as const;

export const DEFAULT_ADMIN_USER = {
  email: 'sdma.officer@maharashtra.gov.in',
  name: 'Maharashtra SDMA',
  subtitle: 'State Disaster Mgmt Authority',
  agencyName: 'State Disaster Management Authority, Government of Maharashtra',
  role: 'ADMIN' as const,
};

export const DEFAULT_GUEST_USER = {
  email: 'guest.observer@aeris.in',
  name: 'Guest User',
  subtitle: 'Public Observer Access',
  agencyName: 'AERIS Public Weather Portal',
  role: 'GUEST' as const,
};
