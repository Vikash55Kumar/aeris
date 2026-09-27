import { Router } from 'express';
import { HydrologyController } from '../controllers/hydrology.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import { UpdateGaugeReadingSchema } from '../schemas/hydrology.schema.js';

export const hydrologyRouter = Router();

hydrologyRouter.get('/overview', HydrologyController.getOverview);
hydrologyRouter.patch(
  '/gauges/:stationCode',
  authenticate,
  requireRole('ADMIN', 'DISPATCHER'),
  validate(UpdateGaugeReadingSchema),
  HydrologyController.updateGauge
);
