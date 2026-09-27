import { RiskLevel } from './weather';

export interface AerisAlert {
  id: string;
  title: string;
  category: 'extreme_rainfall' | 'thunderstorm_lightning' | 'heavy_rainfall' | 'rising_water' | 'inundation';
  severity: RiskLevel;
  location: string;
  timeAgo: string;
  timestamp: string;
  description: string;
  capCategory: string;
  urgency: 'Immediate' | 'Expected' | 'Future';
  certainty: 'Observed' | 'Likely' | 'Possible';
}
