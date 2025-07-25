import express, { Request, Response } from "express";
import userRoutes from './user.routes'
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';

const router = express.Router();

// // Another example route
// router.get('/user', userRoutes);
// router.get('/design', designRoutes);


router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);


export default router;