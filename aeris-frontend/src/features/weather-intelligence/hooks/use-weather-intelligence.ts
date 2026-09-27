'use client';

import { useState } from 'react';
import { WeatherIntelligenceService } from '../services/weather-intelligence.service';

export function useWeatherIntelligence() {
  const [observations] = useState(WeatherIntelligenceService.getAtmosphericObservations());
  return { observations };
}
