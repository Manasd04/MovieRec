import { Router } from 'express';
import {
  getContentBasedRecommendations,
  getUserRecommendations,
} from '../controllers/recommendationController.js';

const router = Router();

// ──────────────────────────────────────────────────────────────
// GET /content-based/:movieId
// Returns content-based similar movies for a given movie
// ──────────────────────────────────────────────────────────────
router.get('/content-based/:movieId', getContentBasedRecommendations);

// ──────────────────────────────────────────────────────────────
// GET /user/:userId
// Returns personalized recommendations for a user
// Supports ?type=hybrid|collaborative|content
// ──────────────────────────────────────────────────────────────
router.get('/user/:userId', getUserRecommendations);

export default router;