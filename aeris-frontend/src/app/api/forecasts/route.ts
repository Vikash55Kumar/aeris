import { NextResponse } from 'next/server';
import { ForecastService } from '@/server/services/forecast.service';

export async function GET() {
  const forecasts = await ForecastService.getForecasts();
  return NextResponse.json({ success: true, data: forecasts });
}
