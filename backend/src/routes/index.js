import { Router } from 'express';
import movieRoutes from './movie.routes.js';
import recommendationRoutes from './recommendation.routes.js';
import authRoutes from './auth.routes.js';
import mlStatusRoutes from './mlStatus.routes.js';

const router = Router();

// Mount all routes
router.use('/movies', movieRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/auth', authRoutes);
router.use('/ml', mlStatusRoutes);

export default router;
