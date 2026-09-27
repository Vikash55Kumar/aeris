import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { LoginSchema, RegisterSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

// Public auth endpoints
authRouter.post('/login', validate(LoginSchema), AuthController.login);
authRouter.post('/guest', AuthController.guestLogin);
authRouter.post('/register', validate(RegisterSchema), AuthController.register);

// Protected auth endpoints
authRouter.get('/me', authenticate, AuthController.me);
