import { Router } from 'express';
import {
  getMovies,
  getMovieById,
  searchMovies,
  getBatchMovies,
} from '../controllers/movieController.js';

const router = Router();

// ──────────────────────────────────────────────────────────────
// GET /
// Returns a paginated list of movies (default: first 24)
// ──────────────────────────────────────────────────────────────
router.get('/', getMovies);

// ──────────────────────────────────────────────────────────────
// GET /search?q=query
// Search movies by title, overview or genres
// ──────────────────────────────────────────────────────────────
router.get('/search', searchMovies);

// ──────────────────────────────────────────────────────────────
// GET /batch?ids=123,456,789
// Get multiple movies by comma-separated IDs
// ──────────────────────────────────────────────────────────────
router.get('/batch', getBatchMovies);

// ──────────────────────────────────────────────────────────────
// GET /:id
// Returns a single movie by ID
// ──────────────────────────────────────────────────────────────
router.get('/:id', getMovieById);

export default router;