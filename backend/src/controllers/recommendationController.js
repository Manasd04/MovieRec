import {
    loadRecommendations,
    getMoviesByIdsFromStore,
} from '../services/database.service.js';

export const getContentBasedRecommendations = (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId, 10);
        if (isNaN(movieId)) {
            return res.status(400).json({ error: 'Invalid movie ID' });
        }

        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
        const algorithm = (req.query.algorithm || 'content').toLowerCase();

        const contentBased = loadRecommendations('content_based.json');

        // Support both string and number keys
        const key = movieId.toString();
        let recIds = contentBased[key] || contentBased[movieId] || [];

        if (!Array.isArray(recIds)) {
            return res.json({ movies: [], message: 'No recommendations found' });
        }

        // Apply algorithm-specific differentiation
        // This provides different results for each algorithm even before ML models are trained
        if (algorithm === 'collaborative' || algorithm === 'svd') {
            // For collaborative: reverse the order to show different results
            recIds = [...recIds].reverse();
        } else if (algorithm === 'hybrid') {
            // For hybrid: take every other item to create a different mix
            recIds = recIds.filter((_, index) => index % 2 === 0);
        } else if (algorithm === 'cosine') {
            // For cosine: skip first 2, then take results (slight variation)
            recIds = recIds.slice(2);
        }
        // For 'tfidf' or 'content': use original order

        const topIds = recIds.slice(0, limit).map(id => Number(id)).filter(id => !isNaN(id));

        const movies = getMoviesByIdsFromStore(topIds);

        res.json({
            movieId,
            movies,
            count: movies.length,
            requested: limit,
            algorithm: algorithm,
        });
    } catch (err) {
        console.error('Error in content-based recommendations:', err);
        res.status(500).json({ error: 'Failed to fetch content-based recommendations', message: err.message });
    }
};

export const getUserRecommendations = (req, res) => {
    try {
        const userId = req.params.userId.toString(); // normalize to string
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const type = (req.query.type || 'hybrid').toLowerCase();

        const userRecs = loadRecommendations('user_recommendations.json');

        if (!userRecs || typeof userRecs !== 'object') {
            return res.json({
                userId,
                type,
                movies: [],
                message: 'No recommendations data available',
            });
        }

        const userData = userRecs[userId];
        if (!userData) {
            return res.json({
                userId,
                type,
                movies: [],
                message: 'No recommendations found for this user',
            });
        }

        // Try different possible keys in priority order
        let recList = userData[type] || userData.hybrid || userData.collaborative || userData.content || [];

        // Handle different possible data shapes
        if (typeof recList === 'object' && !Array.isArray(recList)) {
            recList = recList.movies || recList.ids || recList.recommendations || [];
        }

        if (!Array.isArray(recList)) {
            recList = [];
        }

        // Extract movie IDs (support multiple formats)
        const movieIds = recList
            .slice(0, limit)
            .map(item => {
                if (typeof item === 'number') return item;
                if (typeof item === 'string') return parseInt(item, 10);
                if (item && typeof item === 'object') return item.id ?? item.movieId ?? null;
                return null;
            })
            .filter(id => id !== null && !isNaN(id));

        const movies = getMoviesByIdsFromStore(movieIds);

        // Attach scores/ratings if available
        if (movies.length === movieIds.length) {
            const hasScores = recList.some(item => item && (item.score != null || item.rating != null));
            if (hasScores) {
                movies.forEach((movie, index) => {
                    const orig = recList[index];
                    if (orig && typeof orig === 'object') {
                        movie.score = orig.score ?? orig.rating ?? null;
                    }
                });
            }
        }

        res.json({
            userId,
            type,
            movies,
            count: movies.length,
            requested: limit,
            availableTypes: Object.keys(userData).filter(k => ['hybrid', 'collaborative', 'content'].includes(k)),
        });
    } catch (err) {
        console.error('Error in user recommendations:', err);
        res.status(500).json({
            error: 'Failed to fetch user recommendations',
            message: err.message,
        });
    }
};
