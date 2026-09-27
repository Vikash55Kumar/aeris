export const HAZARD_TYPES = {
  SEVERE_CONVECTIVE: 'Severe Convective System',
  CLOUDBURST: 'Localized Cloudburst Inundation',
  THUNDERSTORM_LIGHTNING: 'Severe Thunderstorm & Lightning',
  URBAN_FLASH_FLOOD: 'Urban Flash Flood & River Deluge',
} as const;

export const ALERT_PROTOCOLS = {
  CAP_VERSION: 'CAP-v1.2',
  AGENCY_AUTHORITY: 'Maharashtra State Disaster Management Authority',
  PARENT_MINISTRY: 'Ministry of Earth Sciences (MoES)',
} as const;
