// src/routes/design.routes.ts
import express from 'express';
import designRoutes from './design.routes'
const router = express.Router();

router.use('/designs', designRoutes);
export default router;