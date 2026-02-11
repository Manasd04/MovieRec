/**
 * Frontend API service - connects to backend
 */

const API_BASE = 'http://localhost:3001/api'

async function request(endpoint, options = {}) {
  // Normalize endpoint path
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${path}`;

  // Debug log – very useful when troubleshooting
  console.log('[API] Fetching:', url);

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    let errorBody
    try {
      errorBody = await res.json()
    } catch {
      errorBody = await res.text()
    }

    const err = new Error(res.statusText || 'API request failed')
    err.status = res.status
    err.body = errorBody
    throw err
  }

  return res.json()
}

/**
 * Map frontend algorithm IDs to backend recommendation types
 * Frontend shows: Hybrid, TF-IDF, Cosine Similarity, SVD
 * Backend supports: hybrid, content, collaborative
 */
function mapAlgorithmToBackendType(algorithm) {
  const algorithmMap = {
    'hybrid': 'hybrid',           // Hybrid recommendations
    'tfidf': 'content',           // Content-based uses TF-IDF
    'cosine': 'content',          // Cosine similarity is part of content-based
    'svd': 'collaborative',       // Collaborative filtering uses SVD
  };

  return algorithmMap[algorithm] || 'content'; // Default to content-based
}

export const api = {
  // Expose low-level request for auth pages
  requestRaw: request,
  getMovies: async (arg1 = '', arg2 = '') => {
    let query = '';
    let genre = '';
    let limit = 24;

    // Handle object argument (from Search.jsx) vs string arguments (from Homepage.jsx)
    if (typeof arg1 === 'object' && arg1 !== null) {
      query = arg1.q || '';
      genre = arg1.genre || '';
      limit = arg1.limit || 24;
    } else {
      query = arg1;
      genre = arg2;
    }

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (genre) params.append('genre', genre);
    params.append('limit', limit);

    return request(`/movies?${params.toString()}`);
  },

  getTrendingMovies: () => request('/movies?limit=10'), // Using standard list as proxy for now

  getMovieById: (id) => request(`/movies/${id}`),

  searchMovies: (query) =>
    request(`/movies/search?q=${encodeURIComponent(query)}`),

  getRecommendationsByMovie: (movieId, limit = 10) =>
    request(`/recommendations/content-based/${movieId}?limit=${limit}`),

  getRecommendationsForUser: (userId, limit = 20, type = 'hybrid') =>
    request(`/recommendations/user/${userId}?limit=${limit}&type=${type}`),

  /**
   * Get recommendations by movie and algorithm
   * Passes algorithm parameter to backend for differentiation
   */
  getRecommendationsByAlgorithm: (movieId, limit = 10, algorithm = 'hybrid') => {
    const backendType = mapAlgorithmToBackendType(algorithm);

    // All algorithms use content-based endpoint for now
    // Backend will differentiate results based on algorithm parameter
    // Once ML models are trained, this will use actual algorithm-specific data
    return request(`/recommendations/content-based/${movieId}?limit=${limit}&algorithm=${algorithm}`);
  },
};

// Named exports for convenience
export const getMovies = api.getMovies;
export const getTrendingMovies = api.getTrendingMovies;
export const searchMovies = api.searchMovies;
export const getMovieById = api.getMovieById;
export const getRecommendationsForUser = api.getRecommendationsForUser;

export default api;