import { z } from 'zod';

export const QueryTelemetrySchema = z.object({
  query: z.object({
    jurisdiction: z.string().optional(),
    limit: z.string().transform((v) => parseInt(v, 10)).optional(),
  }),
});

export const QueryForecastSchema = z.object({
  query: z.object({
    jurisdiction: z.string().optional(),
    offsetHours: z.string().transform((v) => parseInt(v, 10)).optional(),
    timeStep: z.string().default('3h'),
  }),
});

export const QueryDeepDiveSchema = z.object({
  query: z.object({
    category: z.enum(['telemetry', 'timeline', 'rainfall', 'thunderstorm', 'cloudburst']).default('telemetry'),
    eventId: z.string().optional(),
  }),
});

export type QueryTelemetryInput = z.infer<typeof QueryTelemetrySchema>['query'];
export type QueryForecastInput = z.infer<typeof QueryForecastSchema>['query'];
export type QueryDeepDiveInput = z.infer<typeof QueryDeepDiveSchema>['query'];
