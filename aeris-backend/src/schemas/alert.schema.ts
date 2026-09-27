import { z } from 'zod';

export const CreateAlertSchema = z.object({
  body: z.object({
    jurisdictionCode: z.string().default('mumbai_mmr'),
    weatherEventId: z.string().optional(),
    identifier: z.string().optional(),
    sender: z.string().default('sdma.officer@maharashtra.gov.in'),
    status: z.enum(['ACTUAL', 'EXERCISE', 'SYSTEM', 'TEST', 'DRAFT']).default('ACTUAL'),
    msgType: z.enum(['ALERT', 'UPDATE', 'CANCEL', 'ACK', 'ERROR']).default('ALERT'),
    category: z.string().default('Met'),
    eventTitle: z.string().min(3),
    urgency: z.enum(['IMMEDIATE', 'EXPECTED', 'FUTURE', 'PAST', 'UNKNOWN']).default('IMMEDIATE'),
    severity: z.enum(['EXTREME', 'SEVERE', 'MODERATE', 'MINOR', 'UNKNOWN']).default('SEVERE'),
    certainty: z.enum(['OBSERVED', 'LIKELY', 'POSSIBLE', 'UNLIKELY', 'UNKNOWN']).default('LIKELY'),
    headline: z.string().min(5),
    description: z.string().min(5),
    instruction: z.string().optional(),
    targetAreaDesc: z.string().optional(),
  }),
});

export const QueryAlertsSchema = z.object({
  query: z.object({
    jurisdiction: z.string().optional(),
    severity: z.enum(['EXTREME', 'SEVERE', 'MODERATE', 'MINOR']).optional(),
    limit: z.string().transform((v) => parseInt(v, 10)).optional(),
  }),
});

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>['body'];
export type QueryAlertsInput = z.infer<typeof QueryAlertsSchema>['query'];
