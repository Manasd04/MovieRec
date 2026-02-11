import { Router } from 'express';
import {
  getContentBasedRecommendations,
  getUserRecommendations,
} from '../controllers/recommendationController.js';

const router = Router();

// ──────────────────────────────────────────────────────────────
// GET /api/recommendations/content-based/:movieId
// Returns content-based similar movies for a given movie
// ──────────────────────────────────────────────────────────────
router.get('/recommendations/content-based/:movieId', getContentBasedRecommendations);

// ──────────────────────────────────────────────────────────────
// GET /api/recommendations/user/:userId
// Returns personalized recommendations for a user
// Supports ?type=hybrid|collaborative|content
// ──────────────────────────────────────────────────────────────
router.get('/recommendations/user/:userId', getUserRecommendations);

export default router;