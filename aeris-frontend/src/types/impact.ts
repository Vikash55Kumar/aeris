import { RiskLevel } from './weather';

export interface InfrastructureVulnerability {
  id: string;
  name: string;
  type: 'Rail' | 'Highway' | 'Underpass' | 'Airport' | 'Hospital';
  riskLevel: RiskLevel;
  impactDescription: string;
  actionAdvised: string;
}

export interface SituationalCameraFeed {
  id: string;
  name: string;
  location: string;
  status: string;
  timestamp: string;
  imageSrc: string;
  cropStyle?: string;
}
