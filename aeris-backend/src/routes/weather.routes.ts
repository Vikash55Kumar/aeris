import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller.js';

export const weatherRouter = Router();

weatherRouter.get('/overview', WeatherController.getOverview);
weatherRouter.get('/deep-dive', WeatherController.getDetailedAnalysis);
