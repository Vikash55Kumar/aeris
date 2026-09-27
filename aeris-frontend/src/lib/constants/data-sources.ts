export const INGESTION_DATA_SOURCES = [
  { id: 'radar', name: 'IMD S-Band Doppler Radar', agency: 'IMD Mumbai', type: 'Radar', latency: '45s', qcScore: 99.8, status: 'OPTIMAL' },
  { id: 'insat', name: 'INSAT-3DR Rapid Scan', agency: 'ISRO / IMD', type: 'Satellite', latency: '2m', qcScore: 99.4, status: 'OPTIMAL' },
  { id: 'imdaa', name: 'IMDAA Mesoscale NWP', agency: 'NCMRWF', type: 'Atmospheric', latency: '15m', qcScore: 98.9, status: 'OPTIMAL' },
  { id: 'cwc', name: 'Mithi River Telemetry', agency: 'CWC / MCGM', type: 'Hydrology', latency: '30s', qcScore: 100.0, status: 'OPTIMAL' },
  { id: 'aws', name: 'Automatic Weather Stations', agency: 'MCGM / IMD', type: 'Precipitation', latency: '1m', qcScore: 99.1, status: 'OPTIMAL' },
  { id: 'lightning', name: 'Lightning Location Network', agency: 'IITM Pune', type: 'Lightning', latency: '10s', qcScore: 99.9, status: 'OPTIMAL' },
] as const;
