
// src/routes/index.ts
import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './auth.routes';
// Import other route modules as you build them
// import componentRoutes from './components';
// import userRoutes from './users';

const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
// router.use('/components', componentRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

export default router;