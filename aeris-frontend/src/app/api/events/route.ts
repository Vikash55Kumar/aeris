import { NextResponse } from 'next/server';
import { EventService } from '@/server/services/event.service';

export async function GET() {
  const event = await EventService.getActiveEvent();
  return NextResponse.json({ success: true, data: event });
}
