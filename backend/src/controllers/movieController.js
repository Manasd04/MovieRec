import {
    getMoviesFromStore,
    getMovieByIdFromStore,
    getMoviesByIdsFromStore,
} from '../services/database.service.js';

export const getMovies = (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 24, 100);
        const offset = parseInt(req.query.offset, 10) || 0;
        const q = (req.query.q || '').trim().toLowerCase();
        const genre = (req.query.genre || '').trim().toLowerCase();

        let movies = getMoviesFromStore();

        // Validate movies data
        if (!movies) {
            console.error('getMovies: movies is null or undefined');
            return res.status(500).json({ error: 'Movies data not loaded' });
        }

        if (!Array.isArray(movies)) {
            console.error('getMovies: movies is not an array, type:', typeof movies);
            return res.status(500).json({ error: 'Movies data is not an array' });
        }

        console.log(`getMovies: Loaded ${movies.length} movies, q="${q}", genre="${genre}"`);

        // Apply filters
        if (q || genre) {
            movies = movies.filter((m) => {
                if (!m) return false; // Skip null/undefined movies

                let matchesQuery = true;
                let matchesGenre = true;

                if (q) {
                    const title = String(m.title || '');
                    const overview = String(m.overview || '');
                    const titleMatch = title.toLowerCase().includes(q);
                    const overviewMatch = overview.toLowerCase().includes(q);
                    matchesQuery = titleMatch || overviewMatch;
                }

                if (genre) {
                    matchesGenre = m.genres && (
                        Array.isArray(m.genres)
                            ? m.genres.some(g => String(g).toLowerCase().includes(genre))
                            : String(m.genres).toLowerCase().includes(genre)
                    );
                }

                return matchesQuery && matchesGenre;
            });

            console.log(`getMovies: After filtering, found ${movies.length} matches`);
        }

        const total = movies.length;
        const paginated = movies.slice(offset, offset + limit);

        res.json({
            movies: paginated,
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
        });
    } catch (err) {
        console.error('Error in GET /movies:', err);
        console.error('Stack:', err.stack);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
};

export const getMovieById = (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid movie ID' });
        }

        const movie = getMovieByIdFromStore(id);

        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        // Normalize the response
        const normalized = {
            ...movie,
            id: movie.id ?? movie.movieId ?? id,
        };

        res.json({ movie: normalized });
    } catch (err) {
        console.error(`Error in GET /movies/${req.params.id}:`, err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
};

export const searchMovies = (req, res) => {
    try {
        const q = (req.query.q || '').trim().toLowerCase();
        const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);

        if (!q) {
            return res.json({ movies: [], message: 'No search query provided' });
        }

        const allMovies = getMoviesFromStore();

        if (!Array.isArray(allMovies)) {
            return res.status(500).json({ error: 'Movies data is not an array' });
        }

        const filtered = allMovies.filter((m) => {
            const titleMatch = m.title?.toLowerCase().includes(q);
            const overviewMatch = m.overview?.toLowerCase().includes(q);
            const genresMatch =
                m.genres &&
                (Array.isArray(m.genres)
                    ? m.genres.some((g) => String(g).toLowerCase().includes(q))
                    : String(m.genres).toLowerCase().includes(q));

            return titleMatch || overviewMatch || genresMatch;
        });

        res.json({
            movies: filtered.slice(0, limit),
            totalMatches: filtered.length,
            query: q,
            returned: Math.min(filtered.length, limit),
        });
    } catch (err) {
        console.error('Error in GET /movies/search:', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
};

export const getBatchMovies = (req, res) => {
    try {
        const idsStr = req.query.ids;
        if (!idsStr) {
            return res.status(400).json({ error: 'Missing ids parameter' });
        }

        const ids = idsStr
            .split(',')
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id));

        if (ids.length === 0) {
            return res.json({ movies: [] });
        }

        const movies = getMoviesByIdsFromStore(ids);

        res.json({ movies });
    } catch (err) {
        console.error('Error in GET /movies/batch:', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
};
