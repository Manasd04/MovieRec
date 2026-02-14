import { Router } from 'express';
import { existsSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadRecommendations, loadMoviesFromJson } from '../services/database.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');

const router = Router();

/**
 * GET /status
 * Returns information about ML data freshness and availability
 */
router.get('/status', (req, res) => {
    try {
        const status = {
            timestamp: new Date().toISOString(),
            files: {},
            summary: {},
        };

        // Check content_based.json
        const contentBasedPath = path.join(DATA_DIR, 'content_based.json');
        if (existsSync(contentBasedPath)) {
            const stats = statSync(contentBasedPath);
            const data = loadRecommendations('content_based.json');
            const movieCount = Object.keys(data || {}).length;

            status.files.content_based = {
                exists: true,
                lastModified: stats.mtime.toISOString(),
                sizeBytes: stats.size,
                movieCount,
            };
        } else {
            status.files.content_based = {
                exists: false,
                error: 'File not found',
            };
        }

        // Check user_recommendations.json
        const userRecsPath = path.join(DATA_DIR, 'user_recommendations.json');
        if (existsSync(userRecsPath)) {
            const stats = statSync(userRecsPath);
            const data = loadRecommendations('user_recommendations.json');
            const userCount = Object.keys(data || {}).length;

            // Count available types
            const availableTypes = new Set();
            Object.values(data || {}).forEach(userData => {
                if (userData.hybrid) availableTypes.add('hybrid');
                if (userData.collaborative) availableTypes.add('collaborative');
                if (userData.content) availableTypes.add('content');
            });

            status.files.user_recommendations = {
                exists: true,
                lastModified: stats.mtime.toISOString(),
                sizeBytes: stats.size,
                userCount,
                availableTypes: Array.from(availableTypes),
            };
        } else {
            status.files.user_recommendations = {
                exists: false,
                error: 'File not found',
            };
        }

        // Check movies.json
        const moviesPath = path.join(DATA_DIR, 'movies.json');
        if (existsSync(moviesPath)) {
            const stats = statSync(moviesPath);
            const movies = loadMoviesFromJson();

            status.files.movies = {
                exists: true,
                lastModified: stats.mtime.toISOString(),
                sizeBytes: stats.size,
                movieCount: movies.length,
            };
        } else {
            status.files.movies = {
                exists: false,
                error: 'File not found',
            };
        }

        // Generate summary
        const now = new Date();
        const contentBasedAge = status.files.content_based.exists
            ? Math.floor((now - new Date(status.files.content_based.lastModified)) / 1000 / 60 / 60)
            : null;
        const userRecsAge = status.files.user_recommendations.exists
            ? Math.floor((now - new Date(status.files.user_recommendations.lastModified)) / 1000 / 60 / 60)
            : null;

        status.summary = {
            allFilesPresent: status.files.content_based.exists &&
                status.files.user_recommendations.exists &&
                status.files.movies.exists,
            contentBasedAgeHours: contentBasedAge,
            userRecsAgeHours: userRecsAge,
            needsRetraining: contentBasedAge > 168 || userRecsAge > 168, // 1 week
            recommendation: contentBasedAge > 168 || userRecsAge > 168
                ? 'ML data is older than 1 week. Consider retraining models.'
                : 'ML data is fresh.',
        };

        res.json(status);
    } catch (err) {
        console.error('Error in ML status endpoint:', err);
        res.status(500).json({
            error: 'Failed to get ML status',
            message: err.message,
        });
    }
});

export default router;
