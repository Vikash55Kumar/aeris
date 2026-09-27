import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import { CreateAlertSchema } from '../schemas/alert.schema.js';

export const alertRouter = Router();

// Public alert feeds
alertRouter.get('/', AlertController.getAlerts);
alertRouter.get('/cap.xml', AlertController.getCapXml);
alertRouter.get('/:identifier', AlertController.getAlertByIdentifier);

// Admin-only alert creation & broadcast
alertRouter.post('/', authenticate, requireRole('ADMIN', 'DISPATCHER'), validate(CreateAlertSchema), AlertController.createAlert);
