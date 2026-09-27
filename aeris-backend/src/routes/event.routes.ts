import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import { CreateEventSchema } from '../schemas/event.schema.js';

export const eventRouter = Router();

// Command center situation overview
eventRouter.get('/overview', EventController.getOverview);
eventRouter.get('/active', EventController.getActiveEvents);
eventRouter.get('/:code', EventController.getEventByCode);

// Admin-only event creation
eventRouter.post('/', authenticate, requireRole('ADMIN', 'DISPATCHER'), validate(CreateEventSchema), EventController.createEvent);
