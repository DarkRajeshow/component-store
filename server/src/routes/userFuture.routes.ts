import express from 'express';
import { UserController } from '../controllers/userFuture.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);

// Protected routes
router.get('/', AuthMiddleware.authenticate, AuthMiddleware.requireAuth, UserController.getUserData);

export default router;