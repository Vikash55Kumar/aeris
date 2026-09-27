import { z } from 'zod';

export const CreateEventSchema = z.object({
  body: z.object({
    code: z.string().min(2),
    title: z.string().min(3),
    eventType: z.string().default('Mesoscale Convective Storm'),
    stage: z.enum([
      'MOISTURE_ACCUMULATION',
      'CONVECTIVE_INITIATION',
      'INTENSIFICATION',
      'HEAVY_RAINFALL',
      'CLOUDBURST_POTENTIAL',
      'HYDROLOGICAL_RESPONSE',
      'FLOOD_RISK',
      'DECAY',
    ]).default('INTENSIFICATION'),
    severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'CRITICAL']).default('HIGH'),
    confidencePct: z.number().min(0).max(100).default(85.0),
    description: z.string(),
    locationName: z.string(),
    centerLat: z.number(),
    centerLng: z.number(),
    trajectoryDir: z.string().default('NE'),
    trajectorySpeedKmh: z.number().default(25.0),
    rainMinMm: z.number().default(80.0),
    rainMaxMm: z.number().default(120.0),
    peakDurationHours: z.string().default('2–3'),
    jurisdictionCode: z.string().default('mumbai_mmr'),
    affectedAreas: z.array(
      z.object({
        rank: z.number(),
        name: z.string(),
        severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'CRITICAL']),
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
    ).optional(),
  }),
});

export const QueryEventsSchema = z.object({
  query: z.object({
    jurisdiction: z.string().optional(),
    status: z.enum(['ACTIVE', 'DECAYED', 'ALL']).default('ACTIVE'),
    severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'CRITICAL']).optional(),
  }),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>['body'];
export type QueryEventsInput = z.infer<typeof QueryEventsSchema>['query'];
