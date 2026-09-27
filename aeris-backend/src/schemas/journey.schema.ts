import { z } from 'zod';

export const TravelModeEnum = z.enum(['car', 'bike', 'transit', 'emergency']);
export const RouteStrategyEnum = z.enum(['balanced', 'fastest', 'safer']);

export const PlanJourneySchema = z.object({
  body: z.object({
    fromLocation: z.string().min(1, 'Origin location is required'),
    toLocation: z.string().min(1, 'Destination location is required'),
    travelMode: TravelModeEnum.default('car'),
    departureTime: z.string().optional(), // HH:mm or ISO timestamp
    strategy: RouteStrategyEnum.optional().default('balanced'),
  }),
});

export const OptimizeDepartureSchema = z.object({
  body: z.object({
    fromLocation: z.string().min(1, 'Origin location is required'),
    toLocation: z.string().min(1, 'Destination location is required'),
    travelMode: TravelModeEnum.default('car'),
    baseTime: z.string().optional(), // Base time to calculate departure offsets from
  }),
});

export type PlanJourneyInput = z.infer<typeof PlanJourneySchema>['body'];
export type OptimizeDepartureInput = z.infer<typeof OptimizeDepartureSchema>['body'];
