import { z } from 'zod';

export const QueryHydrologySchema = z.object({
  query: z.object({
    jurisdiction: z.string().optional(),
  }),
});

export const UpdateGaugeReadingSchema = z.object({
  params: z.object({
    stationCode: z.string(),
  }),
  body: z.object({
    currentLevelM: z.number(),
    dischargeM3s: z.number().optional(),
    trendPerHourM: z.number().optional(),
  }),
});

export type QueryHydrologyInput = z.infer<typeof QueryHydrologySchema>['query'];
export type UpdateGaugeReadingInput = z.infer<typeof UpdateGaugeReadingSchema>;
