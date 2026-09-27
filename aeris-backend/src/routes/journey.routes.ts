import { Router } from 'express';
import { JourneyController } from '../controllers/journey.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { PlanJourneySchema, OptimizeDepartureSchema } from '../schemas/journey.schema.js';

export const journeyRouter = Router();

journeyRouter.get('/locations', JourneyController.getLocations);
journeyRouter.get('/presets', JourneyController.getPresets);
journeyRouter.post('/plan', validate(PlanJourneySchema), JourneyController.planJourney);
journeyRouter.post('/optimize-departure', validate(OptimizeDepartureSchema), JourneyController.optimizeDeparture);
