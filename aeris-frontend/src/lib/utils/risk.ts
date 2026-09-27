import { RiskLevel } from '@/types/weather';

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'Low';
    case 'moderate': return 'Moderate';
    case 'high': return 'High';
    case 'very_high': return 'Very High';
    case 'critical': return 'Critical';
    default: return 'Normal';
  }
}
