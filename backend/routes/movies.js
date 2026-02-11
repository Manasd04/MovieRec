import { Router } from 'express';
import {
  getMovies,
  getMovieById,
  searchMovies,
  getBatchMovies,
} from '../controllers/movieController.js';

const router = Router();

// ──────────────────────────────────────────────────────────────
// GET /api/movies
// Returns a paginated list of movies (default: first 24)
// ──────────────────────────────────────────────────────────────
router.get('/movies', getMovies);

// ──────────────────────────────────────────────────────────────
// GET /api/movies/search?q=query
// Search movies by title, overview or genres
// ──────────────────────────────────────────────────────────────
router.get('/movies/search', searchMovies);

// ──────────────────────────────────────────────────────────────
// GET /api/movies/batch?ids=123,456,789
// Get multiple movies by comma-separated IDs
// ──────────────────────────────────────────────────────────────
router.get('/movies/batch', getBatchMovies);

// ──────────────────────────────────────────────────────────────
// GET /api/movies/:id
// Returns a single movie by ID
// ──────────────────────────────────────────────────────────────
router.get('/movies/:id', getMovieById);

export default router;