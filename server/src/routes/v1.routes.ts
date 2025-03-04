import express, { Request, Response } from "express";
import userRoutes from './user.routes'
import designRoutes from './design.routes'

const router = express.Router();

// // Another example route
// router.get('/user', userRoutes);
// router.get('/design', designRoutes);

router.use('/users', userRoutes);
router.use('/designs', designRoutes);

export default router;