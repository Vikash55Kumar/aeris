import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { eventRouter } from './event.routes.js';
import { weatherRouter } from './weather.routes.js';
import { hydrologyRouter } from './hydrology.routes.js';
import { journeyRouter } from './journey.routes.js';
import { alertRouter } from './alert.routes.js';
import { healthRouter } from './health.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/events', eventRouter);
apiRouter.use('/weather', weatherRouter);
apiRouter.use('/hydrology', hydrologyRouter);
apiRouter.use('/journey', journeyRouter);
apiRouter.use('/alerts', alertRouter);
apiRouter.use('/health', healthRouter);
