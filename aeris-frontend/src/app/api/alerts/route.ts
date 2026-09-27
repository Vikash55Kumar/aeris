import { NextResponse } from 'next/server';
import { AlertService } from '@/server/services/alert.service';

export async function GET() {
  const alerts = await AlertService.getAlerts();
  return NextResponse.json({ success: true, data: alerts });
}
