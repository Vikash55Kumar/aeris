export const SERVER_ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  RADAR_S_BAND_ENDPOINT: process.env.RADAR_ENDPOINT || 'https://imd.gov.in/radar/mumbai',
  INSAT_3DR_RAPID_SCAN_ENDPOINT: process.env.INSAT_ENDPOINT || 'https://mosdac.gov.in/insat3dr',
  MITHI_CWC_GAUGE_API: process.env.CWC_API || 'https://cwc.gov.in/telemetry/mithi',
} as const;
