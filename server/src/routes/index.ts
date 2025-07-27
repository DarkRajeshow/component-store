
// src/routes/index.ts
import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './auth.routes';
import componentController from '../controllers/component.controller';
// Import other route modules as you build them
// import componentRoutes from './components';
// import userRoutes from './users';

const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
// router.use('/components', componentRoutes);

// Component management routes
router.post('/api/components', componentController.createComponent);
router.get('/api/components', componentController.getComponents);
router.get('/api/components/:id', componentController.getComponentDetails);
router.put('/api/components/:id', componentController.updateComponent);
router.delete('/api/components/:id', componentController.deleteComponent);
router.post('/api/components/:id/revisions', componentController.uploadRevision);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

export default router;